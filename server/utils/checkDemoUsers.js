export function isDemoUser(email) {
    const demoRegex = /^demo-(student|faculty|admin)@fabricationlabs\.com$/;
    return demoRegex.test(email);
}