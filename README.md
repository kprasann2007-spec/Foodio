# Foodio
# Foodio

Foodio is a food delivery app that brings the entire ordering experience online in one platform.

## Screenshots
<img width="1470" height="828" alt="Screenshot 2026-08-19 at 10 08 16 PM" src="https://github.com/user-attachments/assets/ac2822ae-2c3a-480a-937c-e3a20a310ab5" />
<img width="1470" height="829" alt="Screenshot 2026-08-19 at 10 08 32 PM" src="https://github.com/user-attachments/assets/25e11e19-bd99-4a1a-890c-99404d9a7e6c" />
<img width="1470" height="830" alt="Screenshot 2026-08-19 at 10 08 44 PM" src="https://github.com/user-attachments/assets/bc674d18-dd66-4e78-8e3a-581977f2938d" />


## Hosted URL
Not deployed yet

## Features Implemented

### Frontend
- Browse restaurant/food menu with item images, descriptions, and pricing
- Add, remove, and update item quantities in the cart with live price updates
- User authentication (login/signup) with protected routes
- Multi-step checkout flow with delivery address and payment details
- Order confirmation and order history/tracking page
- Responsive UI across mobile and desktop

### Backend
- RESTful APIs for menu, cart, orders, and user authentication
- JWT-based authentication and authorization for protected routes
- MongoDB schemas for users, food items, and orders
- Order management (create, update status, fetch order history)
- Payment integration for processing checkout payments

## Technologies/Libraries/Packages Used

- **Frontend:** React, React Router, Axios, Context API, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, dotenv, cors

## Local Setup

1. Clone the repository
```bash
   git clone kprasann2007-spec/Foodio/
   cd foodio
```

2. Install dependencies for the frontend and backend
```bash
   cd frontend
   npm install

   cd ../backend
   npm install
```

3. Create a `.env` file inside the `backend` folder and add the following:
4. Run the backend server
```bash
   cd backend
   npm run dev
```

5. Run the frontend (in a separate terminal)
```bash
   cd frontend
   npm run dev
```

6. Open the app in your browser
## Team Members

- Pratiksha
- Prasann
- Sanskruti
