export const checkAuth = async (): Promise<boolean> => {
  const token = localStorage.getItem('admin_token');
  return !!token;
};
