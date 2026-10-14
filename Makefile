# ============================================================
# KCS — Tauri (Rust) Makefile
# Location: src-tauri/
# ============================================================

.DEFAULT_GOAL := help
.PHONY: help check build-dev build-release build-installer dev build clean \
        update update-kcs-db update-tauri-plugins check-sqlx \
        db-reset db-check sqlx-add sqlx-run sqlx-revert sqlx-status \
        env fmt clippy test untag-cargo tag-cargo

# ── Helpers ──────────────────────────────────────────────────

CARGO_CONFIG := src-tauri/.cargo/config.toml
DB_PATH := $(HOME)/Library/Application Support/com.kcs.co/database.db
MIGRATIONS_DIR := src/kcs_db/src/database/migrations

# ── Cargo Config Toggle ──────────────────────────────────────

define UNTAG_CARGO
	sed -e 's/^#jobs = 2/jobs = 2/' \
	    -e 's/^#rustflags = /rustflags = /' \
	    -e 's/^#codegen-backend = true/codegen-backend = true/' \
	    -e 's/^#codegen-backend = "cranelift"/codegen-backend = "cranelift"/' \
	    $(1) > $(1).tmp && mv $(1).tmp $(1)
endef

define TAG_CARGO
	sed -e 's/^jobs = 2/#jobs = 2/' \
	    -e 's/^rustflags = /#rustflags = /' \
	    -e 's/^codegen-backend = true/#codegen-backend = true/' \
	    -e 's/^codegen-backend = "cranelift"/#codegen-backend = "cranelift"/' \
	    $(1) > $(1).tmp && mv $(1).tmp $(1)
endef

untag-cargo: ## Enable cranelift + parallel jobs in .cargo/config.toml
	$(call UNTAG_CARGO,$(CARGO_CONFIG))
	@echo "✓ Dev features enabled"

tag-cargo: ## Disable unstable features in .cargo/config.toml
	$(call TAG_CARGO,$(CARGO_CONFIG))
	@echo "✓ Unstable features disabled"

dev: tag-cargo 
	cd src-tauri; cargo tauri dev;

dev-linux: untag-cargo ## Enable dev features then run Tauri dev server
	cd src-tauri; cargo +nightly tauri dev;

build: tag-cargo ## Disable unstable features then build production installers
	cd src-tauri; cargo tauri build;

# ── Code Quality ─────────────────────────────────────────────

check: ## cargo check (fast compile verification)
	cargo check

fmt: ## Format Rust code
	cargo fmt

clippy: ## Run clippy lints
	cargo clippy -- -D warnings

test: ## Run Rust tests
	cargo test

# ── Build ────────────────────────────────────────────────────

build-dev: ## cargo build (debug profile)
	cargo build

build-release: ## cargo build --release
	cargo build --release

build-installer: ## Build production installers (dmg + nsis)
	cargo tauri build

# ── Package Management ───────────────────────────────────────

update: ## cargo update (all dependencies)
	cargo update

update-kcs-db: ## Update only kcs_db crate dependencies
	cargo update -p kcs_db

update-tauri-plugins: ## Update tauri plugins only
	cargo update -p tauri -p tauri-plugin-cli -p tauri-plugin-global-shortcut -p tauri-plugin-single-instance

# ── SQLx Migrations ─────────────────────────────────────────

check-sqlx: ## Verify sqlx compile-time queries
	SQLX_OFFLINE=true cargo sqlx check

db-reset: ## Delete dev database (forces full reinit on next run)
	@echo "Removing $(DB_PATH)..."
	@rm -f "$(DB_PATH)"
	@echo "Done. Next run will recreate from embedded migrations."

db-check: ## Check migration files parse correctly
	@echo "Migrations directory: $(MIGRATIONS_DIR)"
	@ls -la $(MIGRATIONS_DIR)/*.sql 2>/dev/null || echo "No migration files found"

sqlx-add: ## Create new migration: make sqlx-add name="add_patient_email"
	@if [ -z "$(name)" ]; then echo "Usage: make sqlx-add name=\"description\""; exit 1; fi
	@command -v sqlx >/dev/null 2>&1 || { echo "Error: sqlx-cli not installed. Run: cargo install sqlx-cli --no-default-features --features sqlite"; exit 1; }
	sqlx migrate add $(name)

sqlx-run: ## Apply pending migrations to local database
	@command -v sqlx >/dev/null 2>&1 || { echo "Error: sqlx-cli not installed."; exit 1; }
	sqlx migrate run

sqlx-revert: ## Roll back last migration
	@command -v sqlx >/dev/null 2>&1 || { echo "Error: sqlx-cli not installed."; exit 1; }
	sqlx migrate revert

sqlx-status: ## Show migration status
	@command -v sqlx >/dev/null 2>&1 || { echo "Error: sqlx-cli not installed."; exit 1; }
	sqlx migrate info

# ── Clean ────────────────────────────────────────────────────

clean: ## Remove all build artifacts
	cargo clean

# ── Environment ──────────────────────────────────────────────

env: ## Print tool versions
	@echo "=== Rust ==="
	@rustc --version
	@cargo --version
	@echo ""
	@echo "=== SQLx ==="
	@command -v sqlx >/dev/null 2>&1 && sqlx --version || echo "sqlx-cli: NOT INSTALLED"
	@echo ""
	@echo "=== Tauri ==="
	@command -v cargo-tauri >/dev/null 2>&1 && cargo tauri --version || echo "cargo-tauri: NOT INSTALLED"
	@echo ""
	@echo "=== Database ==="
	@test -f "$(DB_PATH)" && echo "Dev DB: EXISTS ($(DB_PATH))" || echo "Dev DB: NOT FOUND (will be created on first run)"

# ── Help ─────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
