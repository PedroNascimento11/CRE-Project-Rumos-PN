# Biblioteca Automation Project

## Overview

This project contains automated API and UI tests for the Biblioteca application using Playwright.

The automation covers the main application features for the following user roles:

* Aluno (Student)
* Funcionário (Employee)
* Administrador (Admin)

The project includes:

* API Testing
* UI Testing
* Page Object Model
* Dynamic Test Data Generation
* Automatic HTML Reports
* Screenshots, Videos and Traces for Failures

---

## Technology Stack

### Language

* JavaScript (Node.js)

### Test Framework

* Playwright

### Additional Libraries

* Faker (dynamic test data generation)

---

## Project Structure

```text
biblioteca-automation/
│
├── helpers/
│   ├── api/
│   └── data/
│
├── pages/
│
├── tests/
│   ├── api/
│   │   ├── admin-users/
│   │   ├── auth/
│   │   ├── books/
│   │   ├── favorites/
│   │   ├── purchases/
│   │   ├── renting/
│   │   └── statistics/
│   │
│   └── ui/
│       ├── admin-users/
│       ├── auth/
│       ├── books/
│       ├── dashboard/
│       ├── favorites/
│       ├── logout/
│       ├── navigation/
│       ├── purchases/
│       └── renting/
│
├── package-lock.json
├── package.json
├── playwright.config.js
└── README.md
```

---

## Test Architecture

### Page Object Model (POM)

UI interactions are separated into Page Objects.

Examples:

* LoginPage
* BooksPage
* BookDetailsPage

Benefits:

* Reusability
* Easier maintenance
* Reduced code duplication

---

### Helper Layer

API operations are abstracted into helper methods.

Examples:

* createUser()
* createBook()

Benefits:

* Cleaner test code
* Reusable setup logic

---

### Dynamic Test Data

Test data is generated dynamically using helper functions.

Examples:

* generateUser()
* generateBook()
* generatePurchase()

Benefits:

* Independent execution
* Reduced data collisions
* Repeatable test runs

---

## Functional Coverage

### API Tests

#### Users

* Create User
* Update User
* Delete User
* List Users

#### Books

* Create Book
* Update Book
* Delete Book
* List Books

#### Favorites

* Add Favorite
* Remove Favorite
* List Favorites

#### Renting

* Create Renting
* Approve Renting
* Reject Renting
* List Rentings

#### Purchases

* Create Purchase
* Purchase Validation
* Approve Purchase
* Cancel Purchase
* List Purchases

---

### UI Tests

#### Authentication

* Login
* Logout

#### Books

* Create Book
* Required Field Validation
* View Book Details

#### Favorites

* Add Favorite
* Remove Favorite
* List Favorites

#### Renting

* Request Renting

#### Purchases

* Register Purchase
* Approve Purchase

#### Admin Users

* Access Admin Area
* Create Employee
* Edit User
* Delete User

---

## Installation

Clone the repository:

```bash
git clone https://github.com/PedroNascimento11/CRE-Project-Rumos-PN.git
```

Enter the project folder:

```bash
cd biblioteca-automation
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

---

## Environment Requirements

* Node.js 18+
* npm
* Biblioteca application running locally

Default application URL:

```text
http://localhost:3000
```

---

## Running API Tests

Execute all API tests:

```bash
npx playwright test tests/api
```

---

## Running UI Tests

Execute all UI tests:

```bash
npx playwright test tests/ui
```

---

## Running a Specific Test File

Example:

```bash
npx playwright test tests/ui/favorites/favorites.spec.js
```

---

## Running the Entire Test Suite

```bash
npx playwright test
```

---

## Running Tests Sequentially

For maximum execution stability:

```bash
npx playwright test --workers=1
```

---

## Execution Result

Final validation was executed using:

```bash
npx playwright test --workers=1 --repeat-each=5

---

## Generating the HTML Report

After execution:

```bash
npx playwright show-report
```

---

## Test Execution Evidence

The Playwright framework automatically generates:

* HTML Reports
* Execution Logs
* Screenshots on Failures
* Videos on Failures
* Trace Files on Failures

These artifacts can be found inside the generated report and test-results folders after execution.

---

## Design Patterns and Good Practices Applied

* Page Object Model (POM)
* Reusable Helper Layer
* Dynamic Test Data Generation
* Independent Tests
* Explicit Waits
* Separation Between API and UI Tests
* Automated Evidence Collection
* Clear Arrange / Act / Assert Structure

---

## Stability Considerations

Tests are designed to be independent and executable without relying on execution order.

Dynamic test data generation and API-based setup are used whenever possible to reduce dependencies between test scenarios.

For the final execution report, tests can be executed sequentially using:

```bash
npx playwright test --workers=1
```

to ensure deterministic execution in environments where application state may be shared.

---

## Author

Pedro Nascimento

QA Automation Engineer Candidate
