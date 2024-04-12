class DataTable {
    id;
    fnGene;
    idFlex;
    options;
    content;
    idContent;
    isFiltered;
    antFiltered;
    indexColumn;

    constructor(id, options = {}) {
        this.id = id;
        this.idFlex = `${id}Flex`;
        this.idContent = `${id}Content`;
        this.options = this.prepareOptions(options)

        this.initializeTable();
    }

    prepareOptions({ theme1 = 'white', theme2 = theme1, colorText = 'black', data = undefined }) {
        return { theme1, theme2, colorText, data }
    }

    initializeTable() {
        if ($(this.idContent).html()) {
            return console.error(
                'The DataTable already exists. Please, execute the class function "destroyTable" to load the DataTable.'
            );
        }
        this.content = this.options.data ?? this.getContent();
        this.initializeStructure();
        this.changePage();
    }

    clearTable() {
        $(`${this.id} tbody`).html('');
        this.content = this.getContent();
        this.changePage(-1);
    }

    destroyTable() {
        this.clearTable();
        $(this.id).removeClass('dataTable')
        $(this.idContent).replaceWith($(this.id).prop('outerHTML'));
    }

    getContent() {
        return $(`${this.id} tbody tr`).map((index, element) => {
            return [$(element).find('td').map((_, td) => $(td).html()).get()];
        }).get();
    }

    getThemes() {
        return `td-${this.options.theme1}-theme1 td-${this.options.theme2}-theme2 td-color-${this.options.colorText}`;
    }

    initializeStructure() {
        $(this.id).addClass('dataTable');

        const themes = this.getThemes();

        $(this.id).wrap(`<div id="${this.id.substring(1)}Content" class="containerDataTable ${themes}">`);
        $(this.idContent).prepend(`<div id="${this.idFlex.substring(1)}" class="flex">`);
        $(this.id).wrap(`<div class="divDataTable">`);

        this.generateButtons();

        this.generateSelect();

        this.generateSearch();

        $('html').off('click', `${this.idContent} .dataTable thead th`);
        $('html').on('click', `${this.idContent} .dataTable thead th`, function (event) {
            this.indexColumn = $(event.target).index();
            this.isFiltered = true;
            this.changePage();
            this.isFiltered = false;
        }.bind(this));
    }

    generateButtons() {
        $(this.idContent).append('<div class="buttonsDataTable">');

        $('html').off('click', `${this.idContent} .buttonDataTable`);
        $('html').on('click', `${this.idContent} .buttonDataTable`, function (event) {
            this.changePage(parseInt($(event.target).attr('pag')));
        }.bind(this));
    }

    generateSearch() {
        $(this.idFlex).append('<div>Search:<input type="text" class="searchDataTable"></div>');

        $('html').off('click', `${this.idContent} .searchDataTable`);
        $('html').on('input', `${this.idContent} .searchDataTable`, function () {
            this.changePage();
        }.bind(this));
    }

    generateSelect() {
        const nums = [5, 10, 25, 50, 100];
        let select = '<select class="selectDataTable">';
        nums.forEach(data => select += `<option value="${data}">${data}</option>`);
        $(this.idFlex).append(select + "</select>");

        $('html').off('click', `${this.idContent} .selectDataTable`);
        $('html').on('change', `${this.idContent} .selectDataTable`, function () {
            this.changePage();
        }.bind(this));
    }

    pageData = (pagCurrent = 0, content) => {
        const cant = parseInt($(`${this.idContent} .selectDataTable`).val())
        const punto = pagCurrent * cant;
        const data = content.slice(punto, punto + cant)

        let res = "";
        for (let col = 0; col < data.length; col++) {
            res += '<tr>';
            for (let row = 0; row < data[col].length; row++) {
                res += `<td>${data[col][row]}</td>`;
            }
            res += '</tr>';
        }
        return res;
    }

    changePage = (numPag = 0) => {
        const content = this.search();
        $(`${this.id} tbody`).html(this.pageData(numPag, content));
        this.createButtons(numPag, content);
    }

    createButtons(pagCurrent, content) {
        let botones = [];
        const length = Math.ceil(content.length / parseInt($(`${this.idContent} .selectDataTable`).val()))
        for (let index = 0; index < length; index++) {
            botones.push(`<button pag="${index}" class="buttonDataTable 
            ${(pagCurrent === index) ? 'pagCurrent' : ''}">${index + 1}</button>`);
        }
        $(`${this.idContent} .buttonsDataTable`).html(this.showInRange(pagCurrent, botones).join(' '));
    }

    showInRange(pagCurrent, data) {
        const range = 2;
        const dataLength = data.length - 1;
        let start = Math.max(0, pagCurrent - range);
        let end = Math.min(dataLength, pagCurrent + range);

        while ((end - start + 1) < 5 && (start > 0 || end < dataLength)) {
            start = Math.max(0, start - 1);
            end = Math.min(dataLength, end + 1);
        }

        data = data.slice(start, end + 1);

        data.unshift(this.shiftLeft(pagCurrent));
        data.push(this.moveRight(pagCurrent, dataLength));

        return data;
    }

    shiftLeft(pagCurrent) {
        return `<button pag="0" ${(pagCurrent === 0) ? 'disabled' : ''} class="buttonDataTable"><<</button>`;
    }

    moveRight(pagCurrent, dataLength) {
        return `<button pag="${dataLength}" ${(pagCurrent === dataLength) ? 'disabled' : ''} class="buttonDataTable">>></button>`;
    }

    search() {
        const input = $(`${this.idContent} .searchDataTable`).val();

        return input === '' ? this.filteredData() : this.filteredData().filter(data => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].includes(input)) {
                    return true;
                }
            }
            return false;
        });
    }

    filteredData() {
        if (this.indexColumn === undefined || !this.isFiltered) return this.content

        const copy = [...this.content]

        if (this.antFiltered != this.indexColumn) this.fnGene = this.fnGenerator(copy)

        this.antFiltered = this.indexColumn

        return this.fnGene.next().value
    }

    *fnGenerator(data) {
        $(`${this.id} thead .down`).removeClass('down');
        $(`${this.id} thead .up`).removeClass('up');
        while (true) {
            $(`${this.id} thead th:nth-child(${this.indexColumn + 1})`).addClass('up');
            yield data.slice().sort((a, b) => a[this.indexColumn].localeCompare(b[this.indexColumn]))
            $(`${this.id} thead .up`).toggleClass('up down');
            yield data.slice().sort((a, b) => b[this.indexColumn].localeCompare(a[this.indexColumn]))
            $(`${this.id} thead .down`).removeClass('down');
            yield data
        }
    }
}