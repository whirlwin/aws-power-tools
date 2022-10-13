(async function bootstrapAwsPowerTools() {

    const consoleRoleList = document.querySelector("#awsc-username-menu-recent-roles");
    // Return if we're on a page without the console role list
    if (consoleRoleList === null) {
        return;
    }

        let storedRoles = (await chrome.storage.local.get('awscFullRoleList'));
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

    const validCsrfToken = document.querySelector('li[data-testid="awsc-role-history-list-item"] input[type="hidden"][name="csrf"]').value
    const liClassName = document.querySelector('li[data-testid="awsc-role-history-list-item"]').className;
    const formClassName = document.querySelector('li[data-testid="awsc-role-history-list-item"] form').className
    const labelClassName = document.querySelector('ul li form label[data-testid="awsc-role-history-list-item-color"] ').className
    const inputSubmitClassName = document.querySelector('ul li form input[data-testid="awsc-role-history-list-item-formatted-name"]').className

    const initialRolesFromConsole = Array.from(consoleRoleList.children);
    const combinedDuplicateRoles = initialRolesFromConsole.concat(storedRoles);
    const combinedRoles = [...new Map(combinedDuplicateRoles.map((r) => [r.title, r])).values()];


    function updateRoleUi() {

        consoleRoleList.innerHTML = '';

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
            consoleRoleList.append(combinedRole);
        });
    }
    updateRoleUi();

    const storableCombinedRoles = combinedRoles.map(combinedRole => {
        return combinedRole.outerHTML;
    });

    chrome.storage.local.set({"awscFullRoleList": JSON.stringify(storableCombinedRoles)});

    (function addRoleListSorting() {
        let sortOrder = true;
        function sortByTitle(elem) {
            combinedRoles.sort((a, b) => {
                if (sortOrder) {
                    return (a.title > b.title) ? 1 : -1;
                } else {
                    return (a.title < b.title) ? 1 : -1;
                }
            })
            updateRoleUi();
            sortOrder = !sortOrder;
        }

        const roleHistoryElement = document.querySelector('#awsc-recent-roles-label');
        if (roleHistoryElement === null) {
            return;
        }
        const roleHistoryDivider = document.createElement("span")
        roleHistoryDivider.innerText = " | ";
        roleHistoryElement.appendChild(roleHistoryDivider);

        const sortingButton =  document.createElement("button");
        sortingButton.innerText = "Sort A-Z"
        sortingButton.addEventListener("click", sortByTitle);
        roleHistoryElement.appendChild(sortingButton);
    })();
}());
