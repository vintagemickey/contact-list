class ContactList {
    selectors = {
        addButton: 'data-js-add',
        deleteButton: 'data-js-delete',
        editButton: 'data-js-edit',
        editOpenButton: 'data-js-edit-open',
        clearButton: 'data-js-clear',
        searchButton: 'data-js-search',
        showAllButton: 'data-js-show-all',
        contactIdAttr: 'data-js-contact-id',
        searchInput: 'data-js-search-input',
        searchResultField: '[data-js-search-result]',
        contactId: '[data-js-contact-id]',
        searchInputField: '[data-js-search-input]',
        formElement: '[data-js-form]',
        contactItem: '.contact-list__item',
        pageLetter: '.contact-list__page-',
        pageElement: '.contact-list__page',
        contactsPage: 'contact-list__page',
        contactsSearchResult: '.contact-list__search-result',
        contactsSearchModal: 'contact-list__search-modal',
        btnClose: 'btn-close',
        errorMessage: '[data-js-error-message]',
    }

    constructor() {
        this.bindEvents();
    }

    addContactOnScreen(id, name, vacancy, phone) {
        const html = `
            <div class="contact-list__item" data-js-contact-id="${id}">
                <span class="contact-list__name">${name}</span>
                <span class="contact-list__vacancy">${vacancy}</span>
                <span class="contact-list__phone">${phone}</span>
                <button class="contact-list__edit" data-js-edit-open data-bs-toggle="modal" data-bs-target=".contact-list__edit-modal">
                    <img src="edit.svg" data-js-edit-open alt="Редактировать" class="contact-list__edit-img"></img>
                </button>
                <button class="contact-list__delete" data-js-delete>
                    <img src="bucket.svg" alt="Удалить" class="contact-list__edit-img" data-js-delete></img>
                </button>
            </div>
        `;
        return html;
    }

    addContact(event) {
        const formData = new FormData(event.target);
        const id = localStorage.length + 1;
        console.log(id);
        const letter = formData.get("name").slice(0, 1);
        const pageElement = document.querySelector(this.selectors.pageLetter + letter);

        if (this.validateForm(event.target.closest(this.selectors.formElement))) {

            formData.append("letter", letter);
            localStorage.setItem(id.toString(), JSON.stringify(Object.fromEntries(formData)));

            pageElement.innerHTML += this.addContactOnScreen(id, formData.get("name"), formData.get("vacancy"), formData.get("phone"));
            this.updateContacts();
            event.target.closest(this.selectors.formElement).reset();
        }

    }

    editContact(event) {
        if (this.validateForm(event.target.closest(this.selectors.formElement))) {
            const id = event.target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr)
            localStorage.removeItem(id);

            const formData = new FormData(event.target);
            const letter = formData.get("name").slice(0, 1);
            formData.append("letter", letter);

            localStorage.setItem(id.toString(), JSON.stringify(Object.fromEntries(formData)));
            this.updateContacts();
        }
    }

    openEditContact(id) {
        const contact = JSON.parse(localStorage.getItem(id.toString()));
        document.getElementById('edit-name').value = contact.name;
        document.getElementById('edit-vacancy').value = contact.vacancy;
        document.getElementById('edit-phone').value = contact.phone;
        document.getElementById('edit-form').setAttribute(this.selectors.contactIdAttr, id.toString());
    }

    searchContacts(event) {
        document.addEventListener('input', (event) => {
            const isSearchInput = event.target.hasAttribute(this.selectors.searchInput);
            const searchInput = document.querySelector(this.selectors.searchInputField);

            if (isSearchInput) {
                const query = searchInput.value.toLowerCase();
                const keys = Object.keys(localStorage);
                const searchResultElement = document.querySelector(this.selectors.searchResultField);
                searchResultElement.innerHTML = '';

                keys.forEach((key) => {
                    const contact = JSON.parse(localStorage.getItem(key));

                    if (contact.name.includes(query)) {
                        searchResultElement.innerHTML += this.addContactOnScreen(key, contact.name, contact.vacancy, contact.phone);
                    }
                })
            }
        })
    }

    showContacts(event) {
        const items = event.target.querySelectorAll(this.selectors.contactItem);
        items.forEach((item) => {
            item.classList.toggle('show');
        });
    }

    showAllContacts(event) {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            const contact = JSON.parse(localStorage.getItem(key));
            const searchResultElement = document.querySelector(this.selectors.searchResultField);
            searchResultElement.innerHTML += this.addContactOnScreen(key, contact.name, contact.vacancy, contact.phone);
        })
    }

    updateContacts() {
        const keys = Object.keys(localStorage);
        const contacts = [];

        keys.forEach((key) => {
            contacts.push(JSON.parse(localStorage.getItem(key)));
        })

        if (contacts.length > 0) {

            contacts.sort((a, b) => {
                if (a.letter < b.letter) {
                    return -1;
                }
                if (a.letter > b.letter) {
                    return 1;
                }
                return 0;
            });

            let count = 0;
            let oldLetter = contacts[0].letter;
            contacts.forEach(contact => {
                const pageElement = document.querySelector(this.selectors.pageLetter + contact.letter);
                if (oldLetter === contact.letter) {
                    count++;
                } else {
                    count = 1;
                    oldLetter = contact.letter;
                }

                pageElement.innerHTML = '';
                pageElement.innerHTML += "<span>" + contact.letter + "</span>" + ` <span class="badge text-bg-secondary">${count}</span>`;
            })

            keys.forEach((key) => {
                const contact = JSON.parse(localStorage.getItem(key));
                const pageElement = document.querySelector(this.selectors.pageLetter + contact.letter);
                pageElement.innerHTML += this.addContactOnScreen(key, contact.name, contact.vacancy, contact.phone);
            })
        } else {
            document.querySelectorAll('.badge').forEach((item) => {
                item.remove();
            })
        }
    }

    deleteContact(id) {
        localStorage.removeItem(id);
        const contactToDelete = document.querySelector(this.selectors.contactItem);
        contactToDelete.remove();
        this.updateContacts();
    }

    clearContacts() {
        const keys = Object.keys(localStorage);

        keys.forEach((key) => {
            this.deleteContact(key);
        })

        localStorage.clear();
        this.updateContacts();

    }

    clearModalSearchContacts() {
        document.querySelector(this.selectors.contactsSearchResult).innerHTML = '';
    }

    /*---------------Валидация-----------------*/
    errorMessages = {
        valueMissing: () => 'Пожалуйста, заполните это поле',
        patternMismatch: ({title}) => title || 'Данные не соответствуют формату',
        tooShort: () => 'Слишком короткое значение, минимальная длина 3 символа',
        tooLong: () => 'Слишком короткое значение, максимальная длина 20 символов',
    }

    manageErrors(fieldControlElement, errorMessages) {
        const fieldErrorsElement = fieldControlElement.parentElement.querySelector(this.selectors.errorMessage);
        fieldErrorsElement.innerHTML = errorMessages.map((message) => `<span class="form__error-message">${message}</span>`)
            .join('');

    }

    validateField(fieldControlElement) {
        const errors = fieldControlElement.validity;
        const errorMessages = [];

        Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
            if (errors[errorType]) {
                errorMessages.push(getErrorMessage(fieldControlElement));
            }
        })

        this.manageErrors(fieldControlElement, errorMessages);

        const isValid = errorMessages.length === 0
        fieldControlElement.ariaInvalid = !isValid
        return isValid
    }

    validateForm(formElement) {
        const requiredControlElements = [...formElement.elements].filter(({required}) => required);
        let isFormValid = true;
        let firstInvalidFieldControl = null;

        requiredControlElements.forEach((element) => {
            const isFieldValid = this.validateField(element);

            if (!isFieldValid) {
                isFormValid = false;

                if (!firstInvalidFieldControl) {
                    firstInvalidFieldControl = element;
                }
            }
        })

        if (!isFormValid) {
            firstInvalidFieldControl.focus();
        }
        return isFormValid
    }

    onBlur(event) {
        const {target} = event;
        const isFormField = target.closest(this.selectors.formElement);
        const isRequired = target.required;

        if (isFormField && isRequired) {
            this.validateField(target);
        }
    }

    bindEvents() {
        window.onload = event => {
            this.updateContacts();
        }

        document.addEventListener('submit', (event) => {
            event.preventDefault();
            const isAdd = event.submitter?.hasAttribute(this.selectors.addButton);
            const isEdit = event.submitter?.hasAttribute(this.selectors.editButton);

            if (isAdd) {
                this.addContact(event);
            }

            if (isEdit) {
                this.editContact(event);
            }
        });

        document.addEventListener('click', (event) => {
            const {target} = event;

            const isDelete = target.hasAttribute(this.selectors.deleteButton);
            const isClear = target.hasAttribute(this.selectors.clearButton);
            const isShowAll = target.hasAttribute(this.selectors.showAllButton);
            const isSearch = target.hasAttribute(this.selectors.searchButton);
            const isEditOpen = target.hasAttribute(this.selectors.editOpenButton);
            const isShowContacts = target.classList.contains(this.selectors.contactsPage);
            const isModalClosedByButton = target.classList.contains(this.selectors.btnClose);
            const isModalClosedBg = target.classList.contains(this.selectors.contactsSearchModal);

            if (isDelete) {
                this.deleteContact(target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr));
            }

            if (isClear) {
                this.clearContacts();
            }

            if (isSearch) {
                this.searchContacts(event);
            }

            if (isShowAll) {
                this.showAllContacts(event);
            }

            if (isEditOpen) {
                this.openEditContact(target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr));
            }

            if (isShowContacts) {
                this.showContacts(event);
            }

            if (isModalClosedByButton || isModalClosedBg) {
                this.clearModalSearchContacts();
            }

            /*---------------Валидация-----------------*/

            document.addEventListener('blur', (event) => {
                this.onBlur(event);
            }, {capture: true})

        });

    }
}

new ContactList();