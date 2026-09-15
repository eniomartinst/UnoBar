export const formatRegisterResponse = () => {
  return {
    message: "User registered successfully"
  };
};

export const formatLoginResponse = (token) => {
  return {
    access_token: token
  };
};

export const formatLogoutResponse = () => {
  return {
    message: "User logged out successfully"
  };
};

export const formatProfileResponse = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    age: user.age,
    createdAt: user.createdAt
  };
};
