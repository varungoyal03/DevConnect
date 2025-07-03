import validator from "validator"



export const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};

export const validateLoginData = (req) => {
  const {  emailId, password } = req.body;

  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error('Email is not valid');
  }

  if (!password) {
    throw new Error('Password is required ');
  }
};  


export const validateEditProfileData = (req) => {
  const allowedEditFields = new Set([
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ]);

  for (const field of Object.keys(req.body)) {
    if (!allowedEditFields.has(field)) return false; // ⏱️ O(1) check
  }

  return true;
};
