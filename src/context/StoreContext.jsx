import { createContext, useState, useEffect } from "react";
import { food_list as initialFoodList, restaurants as initialRestaurants } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState(initialFoodList);
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const applyPromoCode = async (code) => {
    if (!code) {
      setPromoCode("");
      setDiscountAmount(0);
      return { success: false, message: "Promo code cannot be empty" };
    }
    
    // Build cart items array
    const items = food_list
      .filter(item => cartItems[item._id] > 0)
      .map(item => ({ _id: item._id, price: item.price, quantity: cartItems[item._id] }));

    if (items.length === 0) {
      setPromoCode("");
      setDiscountAmount(0);
      return { success: false, message: "Your cart is empty" };
    }

    try {
      const response = await fetch(`${url}/api/promo/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token
        },
        body: JSON.stringify({ code: code.toUpperCase().trim(), items })
      });
      const result = await response.json();
      if (result.success) {
        setPromoCode(code.toUpperCase().trim());
        setDiscountAmount(result.discountAmount);
        return { success: true, message: result.message, discountAmount: result.discountAmount };
      } else {
        setPromoCode("");
        setDiscountAmount(0);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoCode("");
      setDiscountAmount(0);
      return { success: false, message: "Could not reach the server" };
    }
  };

  // Re-validate coupon discount automatically when cartItems change
  useEffect(() => {
    if (promoCode && token) {
      applyPromoCode(promoCode);
    }
  }, [cartItems, token]);

  const fetchFoodList = async () => {
    try {
      const response = await fetch(`${url}/api/food/list`);
      const result = await response.json();
      if (result.success) {
        setFoodList(result.data);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${url}/api/user/restaurants`);
      const result = await response.json();
      if (result.success) {
        const dbRest = result.data || [];
        // Map database IDs to initial restaurants if the names match
        const merged = initialRestaurants.map(item => {
          const match = dbRest.find(dbItem => dbItem.name.toLowerCase() === item.name.toLowerCase());
          if (match) {
            return { ...item, id: match.id };
          }
          return item;
        });

        // Add any newly registered restaurants that are not in the initial set
        dbRest.forEach(dbItem => {
          if (!merged.some(item => item.name.toLowerCase() === dbItem.name.toLowerCase())) {
            merged.push(dbItem);
          }
        });

        setRestaurants(merged);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  useEffect(() => {
    fetchFoodList();
    fetchRestaurants();

    const interval = setInterval(() => {
      fetchFoodList();
      fetchRestaurants();
    }, 10000); // Auto-poll every 10 seconds for real-time menu updates

    return () => clearInterval(interval);
  }, []);

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const contextValue = {
    food_list,
    setFoodList,
    restaurants,
    setRestaurants,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    url,
    promoCode,
    setPromoCode,
    discountAmount,
    setDiscountAmount,
    applyPromoCode
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
