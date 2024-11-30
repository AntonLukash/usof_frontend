export const getToken = (login) => {
    return localStorage.getItem(`token_${login}`);
};
