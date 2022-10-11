(async function bootstrapAwsPowerTools() {

    // Extract correct tokens and class names from initial role list
    const validCsrfToken = document.querySelector('li[data-testid="awsc-role-history-list-item"] input[type="hidden"][name="csrf"]').value
    const liClassName = document.querySelector('li[data-testid="awsc-role-history-list-item"]').className;
    const formClassName = document.querySelector('li[data-testid="awsc-role-history-list-item"] form').className
    const labelClassName = document.querySelector('ul li form label[data-testid="awsc-role-history-list-item-color"] ').className
    const inputSubmitClassName = document.querySelector('ul li form input[data-testid="awsc-role-history-list-item-formatted-name"]').className

    let storedRoles = (await chrome.storage.sync.get('awscFullRoleList'));
    if (Object.keys(storedRoles).length === 0) {
        storedRoles = [];
    } else {
        storedRoles = JSON.parse(storedRoles.awscFullRoleList);
    }
    storedRoles = storedRoles.map(role => {
            let li = document.createElement("li");
            li.innerHTML = role;
            return li.firstChild;
        });

    // Fetch initial roles from the AWS Console
    const ul = document.querySelector("#awsc-username-menu-recent-roles");
    if (ul === null) {
        return;
    }
    const initialRolesFromConsole = Array.from(ul.children);

    const combinedDuplicateRoles = initialRolesFromConsole.concat(storedRoles);
    const combinedRoles = [...new Map(combinedDuplicateRoles.map((r) => [r.title, r])).values()];

    ul.innerHTML = '';

    // Populate UI with combined roles
    combinedRoles.forEach(combinedRole => {
        combinedRole.className = liClassName;
        combinedRole.querySelector("form").className = formClassName;
        combinedRole.querySelector('label[data-testid="awsc-role-history-list-item-color"]').className = labelClassName;
        const submitButton = combinedRole.querySelector("input[type='submit']")
        submitButton.disabled = false;
        submitButton.className = inputSubmitClassName;
        submitButton.classList.remove("current");
        combinedRole.querySelector('input[type="hidden"][name="csrf"]').value = validCsrfToken;
        combinedRole.removeAttribute("disabled");
        ul.append(combinedRole);
    });

    const storableCombinedRoles = combinedRoles.map(combinedRole => {
        return combinedRole.outerHTML;
    });

    chrome.storage.sync.set({"awscFullRoleList": JSON.stringify(storableCombinedRoles)});
}());
