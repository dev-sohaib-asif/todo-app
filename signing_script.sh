#!/usr/bin/env bash
set -euo pipefail

# Wires Android release signing into the Tauri-generated Gradle project, exactly
# following https://v2.tauri.app/distribute/sign/android/
#
# Idempotent — safe to re-run any time (especially after `tauri android init`,
# which regenerates app/build.gradle.kts and wipes the signing block).
#
# Usage:
#   ./signing_script.sh                     # create/use keystore, patch gradle
#   ./signing_script.sh --password <pw>     # use a specific keystore password
#   ./signing_script.sh --regenerate        # throw away old keystore+props, start fresh
#   SIGNING_PASSWORD=<pw> ./signing_script.sh
#   SIGNING_KEYSTORE=/path/to.jks ./signing_script.sh

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$ROOT/src-tauri/gen/android"
GRADLE_FILE="$ANDROID_DIR/app/build.gradle.kts"
PROPS_FILE="$ANDROID_DIR/keystore.properties"
KEYSTORE="${SIGNING_KEYSTORE:-$HOME/.tauri-keys/upload-keystore.jks}"
ALIAS="upload"

REGENERATE=0
PASSWORD="${SIGNING_PASSWORD:-}"
while [[ $# -gt 0 ]]; do
	case "$1" in
		--regenerate) REGENERATE=1; shift ;;
		--password) PASSWORD="${2:?--password needs a value}"; shift 2 ;;
		-h | --help)
			sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*) echo "error: unknown argument: $1 (see --help)" >&2; exit 1 ;;
	esac
done

[[ -f "$GRADLE_FILE" ]] || {
	echo "error: $GRADLE_FILE not found — run 'cargo tauri android init' first" >&2
	exit 1
}

# --- 1. Keystore (official: RSA 2048, 10000 days, alias "upload") -------------
if [[ $REGENERATE -eq 1 ]]; then
	rm -f "$KEYSTORE" "$PROPS_FILE"
	echo "Removed old keystore and keystore.properties"
fi

if [[ ! -f "$KEYSTORE" ]]; then
	if [[ -z "$PASSWORD" && -t 0 ]]; then
		read -rsp "New keystore password (empty = random): " PASSWORD && echo
	fi
	if [[ -z "$PASSWORD" ]]; then
		PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"
		echo "Generated password (saved in $PROPS_FILE, mode 600): $PASSWORD"
	fi
	mkdir -p "$(dirname "$KEYSTORE")"
	keytool -genkey -v -keystore "$KEYSTORE" -keyalg RSA -keysize 2048 -validity 10000 \
		-alias "$ALIAS" -storepass "$PASSWORD" -keypass "$PASSWORD" \
		-dname "CN=todo-app, OU=mobile, O=todo-app, L=Local, ST=Local, C=US" >/dev/null
	echo "Created keystore: $KEYSTORE (alias: $ALIAS)"
else
	if [[ -z "$PASSWORD" && -f "$PROPS_FILE" ]]; then
		PASSWORD="$(sed -n 's/^password=//p' "$PROPS_FILE")"
	fi
	if [[ -z "$PASSWORD" && -t 0 ]]; then
		read -rsp "Keystore password for $KEYSTORE (empty = abort): " PASSWORD && echo
	fi
	[[ -n "$PASSWORD" ]] || {
		echo "error: password unknown. Re-run with --password <pw> or --regenerate" >&2
		exit 1
	}
	keytool -list -keystore "$KEYSTORE" -storepass "$PASSWORD" -alias "$ALIAS" >/dev/null 2>&1 || {
		echo "error: wrong password/alias for $KEYSTORE. Re-run with --password <pw> or --regenerate" >&2
		exit 1
	}
	echo "Using existing keystore: $KEYSTORE (alias: $ALIAS)"
fi

# --- 2. keystore.properties (official format: one "password" key for both) ----
(umask 077 && cat >"$PROPS_FILE" <<EOF
password=$PASSWORD
keyAlias=$ALIAS
storeFile=$KEYSTORE
EOF
)
echo "Wrote $PROPS_FILE"

# --- 3. Patch app/build.gradle.kts (each step idempotent) ---------------------
# 3a. imports (FileInputStream for the official snippet; Properties is the template's own)
grep -qxF 'import java.io.FileInputStream' "$GRADLE_FILE" || sed -i '1i import java.io.FileInputStream' "$GRADLE_FILE"
grep -qxF 'import java.util.Properties' "$GRADLE_FILE" || sed -i '1i import java.util.Properties' "$GRADLE_FILE"

# 3b. signingConfigs block, immediately before buildTypes (official docs order)
if ! grep -q 'rootProject.file("keystore.properties")' "$GRADLE_FILE"; then
	grep -q '^    buildTypes {$' "$GRADLE_FILE" || {
		echo "error: cannot find '    buildTypes {' in $GRADLE_FILE" >&2
		exit 1
	}
	BLOCK='    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            val keystoreProperties = Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(FileInputStream(keystorePropertiesFile))
            }
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }
'
	awk -v block="$BLOCK" '
		BEGIN { n = split(block, lines, "\n") }
		!done && /^    buildTypes \{$/ { for (i = 1; i < n; i++) print lines[i]; done = 1 }
		{ print }
	' "$GRADLE_FILE" >"$GRADLE_FILE.tmp" && mv "$GRADLE_FILE.tmp" "$GRADLE_FILE"
	echo "Inserted signingConfigs block into build.gradle.kts"
fi

# 3c. release buildType uses the signing config
if ! grep -q 'signingConfig = signingConfigs.getByName("release")' "$GRADLE_FILE"; then
	sed -i '/^        getByName("release") {$/a\            signingConfig = signingConfigs.getByName("release")' "$GRADLE_FILE"
	echo "Assigned signingConfig to the release buildType"
fi

echo
echo "Signing wired up. Build the signed release APK with:"
echo "  cargo tauri android build --apk --target aarch64"
