export const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject?.() ?? userDoc;
    delete user?.password;
    return user;
  };
  