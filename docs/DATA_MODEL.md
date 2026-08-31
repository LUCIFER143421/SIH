# CRIMENET AI: Data Model & Graph Schema Reference

---

## 1. Graph Node Labels & Attributes

| Node Label | Key Attributes | Description |
| :--- | :--- | :--- |
| **`PERSON`** | `id`, `name`, `aliases`, `role`, `risk_score` | Syndicate coordinators, drivers, couriers, accountants |
| **`PHONE`** | `id`, `number`, `carrier`, `note` | Burner numbers, SIM cards, dispatch lines |
| **`VEHICLE`** | `id`, `plate_number`, `make`, `owner` | Escort vehicles, transport trucks, cargo cars |
| **`LOCATION`** | `id`, `name`, `city`, `category` | Warehouses, hideouts, transit hubs, port terminals |
| **`ORGANIZATION`**| `id`, `name`, `reg_no`, `role` | Front logistics firms, shell bullion traders |
| **`ACCOUNT`** | `id`, `account_number`, `bank`, `holder` | Layered bank accounts, Hawala deposit accounts |

---

## 2. Graph Relationship Types & Semantics

| Edge Type | Valid Node Pairs | Semantics |
| :--- | :--- | :--- |
| **`CALLS` / `COMMUNICATED_WITH`** | `PERSON → PERSON` or `PERSON → PHONE` | Call or SMS interaction from CDR dump |
| **`TRANSFERRED_MONEY_TO`** | `ACCOUNT → ACCOUNT` or `PERSON → ORG` | Financial transaction or Hawala layering |
| **`MEETS` / `SEEN_WITH`** | `PERSON → PERSON` | Visual co-occurrence from surveillance log |
| **`OWNS` / `USES`** | `PERSON → VEHICLE` or `PERSON → PHONE` | Asset ownership or operating control |
| **`LOCATED_AT` / `VISITED`** | `PERSON → LOCATION` | Physical presence at a geographic location |
| **`WORKS_FOR` / `ASSOCIATED_WITH`** | `PERSON → ORGANIZATION` | Corporate role or criminal affiliation |
