export function isDemoUser(email) {
    const demoRegex = /^demo-(student|faculty|admin)@fablabs\.com$/;
    return demoRegex.test(email);
}
