export const capitalize = (value) => {
    if (!value) {
        return value;
    }
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};
export const formatServiceName = (value) => {
    return `@repo/${value}`;
};
//# sourceMappingURL=index.js.map