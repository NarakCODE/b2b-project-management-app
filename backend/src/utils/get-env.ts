/**
 * Get the value of an environment variable.
 * @param {string} key - The key of the environment variable.
 * @param {string} defaultValue - The default value to return if the environment variable is not set.
 * @returns {string} - The value of the environment variable.
 * @usage
 * const value = getEnv('MY_VARIABLE', 123);
 */

export const getEnv = (key: string, defaultValue: string = '') => {
    const value = process.env[key];

    if (value === undefined) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};
