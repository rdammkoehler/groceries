# Change Log

## 0.1.0 - 2026-04-12

### Added
- Initial project setup with Next.js 16, TypeScript, Tailwind CSS 4, and Prisma 7
- GroceryItem database model with name, quantity, date_entered, and last_purchase_date fields
- REST API routes for creating, listing, deleting, and toggling purchase status of grocery items
- Add Items view for entering grocery items one at a time with name and quantity
- Shopping View with checkboxes to mark items as purchased (stores last_purchase_date timestamp)
- Navigation bar to switch between Grocery List and Shopping View
- Unit tests for AddItemForm, GroceryList, and ShoppingList components (14 tests)
