/**
 * This file is part of Perhelukudiplomi data converter.
 *
 * @author Miika Koskela <miika.s.koskela@gmail.com>
 * @copyright 2020 Tampereen kaupunginkirjasto
 * @license MIT
 */
// @ts-check
function getCurrentDateString() {
    const date = new Date();

    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let dayno = date.getDate().toString();

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

    let containsDuplicates = false;

    const isbns = [];
    const log = document.querySelector("#log");
    const files = document.querySelector("input[type='file']");

    files.addEventListener("change", function (event) {
        const reader = new FileReader();

        reader.onload = function (event) {
            // raw data lines
            const raw = event.target.result.toString().split("\n");

            // number of the row where column headers are
            const headerRow = parseInt(document.querySelector("#headerRow").value);

            // actual data columns; from headerRow till end
            let lines = raw.slice(headerRow + 1);

            // column names
            let columnNames = getColumns(raw[headerRow]);

            for (let i = 0; i < lines.length; i++) {
                let columns = getColumns(lines[i]);

                if (columns.length != columnNames.length) {
                    console.log("not long enough, skipping...");
                    continue;
                }

                let book = {};
                for (let col = 0; col < columnNames.length; col++) {
                    book[columnNames[col]] = columns[col];
                }

                result.books.books.push(book);
            }

            result.books.books = result.books.books.map((book) => {
                book["alternatives"] = [];

                // combine alternative fields into objects and remove separate
                // properties
                for (const property in book) {
                    if (property.search(/^\d:/) === -1) {
                        continue;
                    }

                    let key = property.substring(2);
                    let index = parseInt(property.substring(0, 1)) - 1;

                    let alternative = {};
                    if (typeof book["alternatives"][index] !== "undefined") {
                        alternative = book["alternatives"][index];
                    }

                    alternative[key] = book[property];

                    book["alternatives"][index] = alternative;

                    delete book[property];
                }

                // filter out objects with empty values
                book.alternatives = book.alternatives.filter((alternative) => {
                    if (alternative["alternativeAvailabilityUrl"].trim() === "" && alternative["alternativeLabel"].trim() === "") {
                        return false;
                    }

                    return true;
                });

                return book;
            });

            // TODO: Duplicate checking doesn't work yet
            if (containsDuplicates) {
                alert("Sisältää duplikaatteja! Ei voida luoda JSON-tiedostoa.");
            } else {
                const blob = new Blob([JSON.stringify(result, null, 2)], {
                    type: "text/json",
                });

                const a = document.querySelector("a.btn");
                a.href = window.URL.createObjectURL(blob);
            }
        };

        reader.readAsText(event.target.files[0]);
    });

    const button = document.querySelector("a.btn");
    button.addEventListener("click", function (event) {
        const element = event.target;
        const href = element.getAttribute("href");
        if (href.length < 1) {
            event.preventDefault();
        }
    });
})();

const getColumns = (line) => {
    return line.split("\t").map((column) => column.trim());
};
