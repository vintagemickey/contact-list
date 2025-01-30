/// <reference lib="dom.iterable" />

type Selectors = Record<string, string>;

type Contact = {
    id: string;
    name: string;
    vacancy: string;
    phone: string;
    letter: string;
}

class ContactList {

    private selectors: Selectors = {
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

    private errorMessages = {
        valueMissing: (): string => 'Пожалуйста, заполните это поле',
        patternMismatch: ({title}) => title || 'Данные не соответствуют формату',
        tooShort: (): string => 'Слишком короткое значение, минимальная длина 3 символа',
        tooLong: (): string => 'Слишком короткое значение, максимальная длина 20 символов',
    }

    constructor() {
        this.bindEvents();

    }

    addContactOnScreen(contact: Contact): string {
        const html = `
            <div class="contact-list__item" data-js-contact-id="${contact.id}">
                <span class="contact-list__name">${contact.name}</span>
                <span class="contact-list__vacancy">${contact.vacancy}</span>
                <span class="contact-list__phone">${contact.phone}</span>
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

    addContact(event: SubmitEvent): void {
        const target = event.target as HTMLInputElement;

        const formData = new FormData(event.target as HTMLFormElement);
        const contact: Contact = {
            id: 'id_' + (localStorage.length + 1),
            name: formData.get("name") as string,
            letter: formData.get("name").slice(0, 1) as string,
            vacancy: formData.get("vacancy") as string,
            phone: formData.get("phone") as string,
        }

        const pageElement: Element = document.querySelector(this.selectors.pageLetter + contact.letter) as Element;

        if (this.validateForm(target.closest(this.selectors.formElement))) {
            localStorage.setItem(contact.id, JSON.stringify(contact));
            pageElement.innerHTML += this.addContactOnScreen(contact);
            this.updateContacts();
            const addForm: HTMLFormElement = target.closest(this.selectors.formElement) as HTMLFormElement;
            addForm.reset();
        }

    }

    editContact(event: SubmitEvent, id: string): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;

        if (this.validateForm(target.closest(this.selectors.formElement))) {
            localStorage.removeItem(id);

            const formData = new FormData(event.target as HTMLFormElement);
            const letter: string = formData.get("name").slice(0, 1) as string;
            formData.append("letter", letter);

            localStorage.setItem(id.toString(), JSON.stringify(Object.fromEntries(formData)));
            this.updateContacts();
        }
    }

    openEditContact(id: string): void {
        const contact: Contact = JSON.parse(<string>localStorage.getItem(id));
        let editForm: HTMLFormElement = document.getElementById('edit-form') as HTMLFormElement;
        let editName: HTMLFormElement = document.getElementById('edit-name') as HTMLFormElement;
        let editVacancy: HTMLFormElement = document.getElementById('edit-vacancy') as HTMLFormElement;
        let editPhone: HTMLFormElement = document.getElementById('edit-phone') as HTMLFormElement;

        editName.value = contact.name;
        editVacancy.value = contact.vacancy;
        editPhone.value = contact.phone;

        editForm.setAttribute(this.selectors.contactIdAttr, id);
    }

    searchContacts(): void {
        document.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const isSearchInput: boolean = target.hasAttribute(this.selectors.searchInput);
            const searchInput: HTMLInputElement = document.querySelector(this.selectors.searchInputField);

            if (isSearchInput) {
                const query: string = searchInput.value.toLowerCase();
                const keys: string[] = Object.keys(localStorage);
                const searchResultElement: HTMLElement = document.querySelector(this.selectors.searchResultField) as HTMLElement;
                searchResultElement.innerHTML = '';

                keys.forEach((key: string) => {
                    const contact: Contact = JSON.parse(<string>localStorage.getItem(key));

                    if (contact.name.includes(query)) {
                        searchResultElement.innerHTML += this.addContactOnScreen(contact);
                    }
                })
            }
        })
    }

    showContacts(event: MouseEvent): void {
        const items: HTMLElement[] = Array.from((event.target as HTMLElement).querySelectorAll(this.selectors.contactItem));

        items.forEach((item:HTMLElement) => {
            item.classList.toggle('show');
        });
    }

    showAllContacts(): void {
        const keys: string[] = Object.keys(localStorage);
        keys.forEach((key) => {
            const contact: Contact = JSON.parse(<string>localStorage.getItem(key));
            const searchResultElement: HTMLElement = document.querySelector(this.selectors.searchResultField) as HTMLElement;
            searchResultElement.innerHTML += this.addContactOnScreen(contact);
        })
    }

    updateContacts(): void {
        const keys: string[] = Object.keys(localStorage);
        const contacts: Contact[] = [];

        keys.forEach((key: string) => {
            contacts.push(JSON.parse(<string>localStorage.getItem(key)));
        })

        if (contacts.length > 0) {
            // собираем информацию о кол-ве контактов по каждой букве
            let letters: string[] = contacts.map(contact => contact.letter);
            letters = letters.filter((letter, index) => letters.indexOf(letter) === index);

            type Counter = { letter:string; count:number };
            let counters: Counter[] = letters.map(letter => {
                return {
                    letter: letter,
                    count: contacts.filter(contact => contact.letter === letter).length
                };
            });

            //добавляем баджи на страницу
            counters.map(counter => {
                const pageElement: Element = document.querySelector(this.selectors.pageLetter + counter.letter) as Element;
                pageElement.innerHTML = '';
                pageElement.innerHTML += "<span>" + counter.letter + "</span>" + ` <span class="badge text-bg-secondary">${counter.count}</span>`;
            })

            contacts.map((contact: Contact) => {
                const pageElement: Element  = document.querySelector(this.selectors.pageLetter + contact.letter) as Element;
                pageElement.innerHTML += this.addContactOnScreen(contact);
            })
        } else {
            document.querySelectorAll('.badge').forEach((item) => {
                item.remove();
            })
        }
    }

    deleteContact(id:string): void {
        localStorage.removeItem(id);
        const contactToDelete: HTMLElement = document.querySelector(this.selectors.contactItem) as HTMLElement;
        contactToDelete.remove();
        this.updateContacts();
    }

    clearContacts(): void {
        const keys:string[] = Object.keys(localStorage);

        keys.forEach((key) => {
            this.deleteContact(key);
        })

        localStorage.clear();
        this.updateContacts();

    }

    clearModalSearchContacts(): void {
        const contactsSearchResult: HTMLElement = document.querySelector(this.selectors.contactsSearchResult);
        contactsSearchResult.innerHTML = '';
    }


    /*---------------Валидация-----------------*/

    manageErrors(fieldControlElement: HTMLInputElement, errorMessages: string[]): void {
        const fieldErrorsElement: HTMLElement = fieldControlElement.parentElement.querySelector(this.selectors.errorMessage) as HTMLElement;
        fieldErrorsElement.innerHTML = errorMessages.map((message: string): string => `<span class="form__error-message">${message}</span>`)
            .join('');

    }

    validateField(fieldControlElement: HTMLInputElement): boolean {
        const errors: ValidityState = fieldControlElement.validity;
        const errorMessages: string[] = [];

        Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
            if (errors[errorType]) {
                errorMessages.push(getErrorMessage(fieldControlElement) as string);
            }
        })

        this.manageErrors(fieldControlElement, errorMessages);

        const isValid: boolean = errorMessages.length === 0;
        fieldControlElement.ariaInvalid = isValid ? "false" : "true";
        return isValid
    }

    validateForm(formElement: HTMLFormElement): boolean {
        const requiredControlElements: Element[] = Array.from(formElement.elements).filter(({ required }: HTMLFormElement) => required);
        let isFormValid: boolean = true;
        let firstInvalidFieldControl: HTMLInputElement;

        requiredControlElements.forEach((element: HTMLInputElement) => {
            const isFieldValid: boolean = this.validateField(element);

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

    onBlur(event: FocusEvent): void {
        const target = event.target as HTMLInputElement;
        const isFormField: HTMLFormElement = target.closest(this.selectors.formElement) as HTMLFormElement;
        const isRequired: boolean = target.required;

        if (isFormField && isRequired) {
            this.validateField(target);
        }
    }


    bindEvents(): void {
        window.onload = event => {
            this.updateContacts();
        }

        document.addEventListener('submit', (event: SubmitEvent): void => {
            event.preventDefault();
            const isAdd: boolean = <boolean>event.submitter?.hasAttribute(this.selectors.addButton);
            const isEdit: boolean = <boolean>event.submitter?.hasAttribute(this.selectors.editButton);
            const target: HTMLElement = event.target as HTMLElement;

            if (isAdd) {
                this.addContact(event);
            }

            if (isEdit) {
                this.editContact(event, target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr) as string);
            }
        });

        document.addEventListener('click', (event: MouseEvent): void => {
            const target: HTMLElement = event.target as HTMLElement;

            const isDelete: boolean = <boolean>target.hasAttribute(this.selectors.deleteButton);
            const isClear = target.hasAttribute(this.selectors.clearButton);
            const isShowAll: boolean = <boolean>target.hasAttribute(this.selectors.showAllButton);
            const isSearch: boolean = <boolean>target.hasAttribute(this.selectors.searchButton);
            const isEditOpen: boolean = <boolean>target.hasAttribute(this.selectors.editOpenButton);
            const isShowContacts: boolean = <boolean>target.classList.contains(this.selectors.contactsPage);
            const isModalClosedByButton: boolean = <boolean>target.classList.contains(this.selectors.btnClose);
            const isModalClosedBg: boolean = <boolean>target.classList.contains(this.selectors.contactsSearchModal);

            if (isDelete) {
                this.deleteContact(target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr) as string);
            }

            if (isClear) {
                this.clearContacts();
            }

            if (isSearch) {
                this.searchContacts();
            }

            if (isShowAll) {
                this.showAllContacts();
            }

            if (isEditOpen) {
                this.openEditContact(target.closest(this.selectors.contactId).getAttribute(this.selectors.contactIdAttr) as string);
            }

            if (isShowContacts) {
                this.showContacts(event);
            }

            if (isModalClosedByButton || isModalClosedBg) {
                this.clearModalSearchContacts();
            }

            /*---------------Валидация-----------------*/

            document.addEventListener('blur', (event: FocusEvent) => {
                this.onBlur(event);
            }, {capture: true})

        });

    }
}

const cl = new ContactList();
