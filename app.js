/**
 * This file is part of Perhelukudiplomi data converter.
 *
 * @author Miika Koskela <miika.s.koskela@gmail.com>
 * @copyright 2020 Tampereen kaupunginkirjasto
 * @license MIT
 */

function getCurrentDateString() {
    const date = new Date();

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dayno = date.getDate();

    if (month.toString().length == 1) {
        month = "0" + month.toString();
    }

    if (dayno.toString().length == 1) {
        dayno = "0" + dayno.toString();
    }

    return "" + year + "-" + month + "-" + dayno;
}

(function () {
    const result = {
        books: {
            title: "Perhelukudiplomin kirjalista",
            description: "",
            updated: getCurrentDateString(),
            books: [],
        },
    };

    const isbns = [];
    let containsDuplicates = false;
    const log = document.querySelector("#log");
    const files = document.querySelector("input[type='file']");
    files.addEventListener("change", function (event) {
        const reader = new FileReader();

        reader.onload = function (event) {
            let columnNames = {};
            const lines = event.target.result.split("\n");

            const headerRow = document.querySelector("#headerRow").value;
            for (let i = 0; i < lines.length; i++) {
                // skip all the rows above header row
                if (i < headerRow) {
                    continue;
                }

                let columns = getColumns(lines[i]);

                // capture column names
                if (i == headerRow) {
                    columnNames = columns;
                    continue;
                }

                if (columns.length != columnNames.length) {
                    continue;
                }

                let book = {};
                for (let col = 0; col < columnNames.length; col++) {
                    book[columnNames[col]] = columns[col];
                }

                result.books.books.push(book);
            }
        };

        reader.readAsText(event.target.files[0]);
    });
})();

const getColumns = (line) => {
    return line.split("\t").map((column) => column.trim());
};
