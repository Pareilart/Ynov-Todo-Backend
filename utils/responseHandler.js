const createResponse = (success = false, data = null, message = "") => {
  return {
    success,
    data,
    message
  };
};

export default createResponse; 