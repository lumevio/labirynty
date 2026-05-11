import os

BASE_PATH = r"C:\Users\user\Desktop\labiryntzator\public\assets"

QUESTS = 15

folders = []

# =========================
# QUESTS
# =========================
for i in range(1, QUESTS + 1):
    folders.extend([
        f"quests/quest{i}",
    ])

# =========================
# UI
# =========================
folders.extend([
    "ui/buttons",
    "ui/icons",
    "ui/hud",
])

# =========================
# ITEMS
# =========================
folders.append("items")

# =========================
# FALLBACK
# =========================
folders.append("fallback")

# =========================
# CREATE STRUCTURE
# =========================
for folder in folders:
    path = os.path.join(BASE_PATH, folder)
    os.makedirs(path, exist_ok=True)
    print(f"Created: {path}")

print("\n✅ Assets folder structure generated successfully!")