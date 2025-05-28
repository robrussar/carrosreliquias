/**
 * Debounce function to limit the rate at which a function is executed.
 * Useful for optimizing input, search, or scroll events.
 * @param {Function} func - The function to debounce
 * @param {Number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
    let timeout; // Timer ID
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout); // Clear the timer
            func(...args); // Call the original function with arguments
        };
        clearTimeout(timeout); // Clear any existing timer
        timeout = setTimeout(later, wait); // Set a new timer
    };
}

/**
 * Formats a number with thousands separators and locale-specific notation.
 * Useful for formatting large numbers like population, currency, etc.
 * @param {Number} num - The number to format
 * @param {String} [locale='en-US'] - The locale to use for formatting (default is 'en-US')
 * @param {Object} [options={}] - Additional options for number formatting
 * @returns {String} - The formatted number
 */
export function formatNumber(num, locale = 'pt-BR', options = {}) {
    if (isNaN(num)) {
        return '0'; // Return '0' if the input is not a valid number
    }

    const defaultOptions = { 
        minimumFractionDigits: 0, // Default: no decimal digits
        maximumFractionDigits: 2 // Default: up to 2 decimal digits
    };

    // Combine default options with the provided options
    const formatOptions = { ...defaultOptions, ...options };

    return new Intl.NumberFormat(locale, formatOptions).format(num);
}

/**
 * Utility function to format a currency value.
 * Provides a more specific implementation for formatting monetary values.
 * @param {Number} amount - The currency value to format
 * @param {String} [locale='en-US'] - The locale to use for formatting (default is 'en-US')
 * @param {String} [currency='USD'] - The currency code (e.g., USD, EUR, BRL)
 * @returns {String} - The formatted currency value
 */
export function formatCurrency(amount, locale = 'pt-BR', currency = 'USD') {
    return new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency: currency 
    }).format(amount);
}