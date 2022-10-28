(async function bootstrapAwsPowerTools() {

    /*** BEGIN: ROLE SWITCHER ***/
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
    let combinedRoles = [...new Map(combinedDuplicateRoles.map((r) => [r.title, r])).values()];


    function updateRoleUi(roles) {

        consoleRoleList.innerHTML = '';

        // Populate UI with combined roles
        roles.forEach(combinedRole => {
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
    updateRoleUi(combinedRoles);

    const storableCombinedRoles = combinedRoles.map(combinedRole => {
        return combinedRole.outerHTML;
    });

    chrome.storage.local.set({"awscFullRoleList": JSON.stringify(storableCombinedRoles)});

    (function addRoleListSorting() {

        let sortOrder = true;
        function sortByTitle() {
            combinedRoles.sort((a, b) => {
                if (sortOrder) {
                    return (a.title > b.title) ? 1 : -1;
                } else {
                    return (a.title < b.title) ? 1 : -1;
                }
            })
            updateRoleUi(combinedRoles);
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

    (function addRoleListSearch() {
        const roleHistoryElement = document.querySelector('#awsc-recent-roles-label');
        if (roleHistoryElement === null) {
            return;
        }
        const roleSearchDivider = document.createElement("span")
        roleSearchDivider.innerText = " | ";
        roleHistoryElement.appendChild(roleSearchDivider);
        const searchField = document.createElement("input");
        searchField.placeholder = "Search..."
        searchField.addEventListener("keyup", () => {
            const combinedRolesSearch = combinedRoles.filter(r => {
                return r.title.includes(searchField.value);
            });
            updateRoleUi(combinedRolesSearch);
        })
        roleHistoryElement.appendChild(searchField);

        const navUsernameMenu = document.querySelector("#nav-usernameMenu")
        navUsernameMenu.addEventListener("click", () => {
            window.setTimeout(() => searchField.focus(), 0);
        });
    })();

    /*** END: ROLE SWITCHER ***/

    /*** BEGIN: ROUTE53 ENHANCEMENTS ***/
    (function addRoute53EnhancementsIfApplicable() {
        if (window.location.pathname.startsWith("/route53")) {
            Array.from(document.querySelectorAll('awsui-table[data-testid="daas-list-records"] th'))
                .filter()
        }
    })();
    /*** END: ROUTE53 ENHANCEMENTS ***/
}());
