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

const template = () => {
    return {
        title: "Pirkanmaan lukudiplomi",
        description: "",
        updated: getCurrentDateString(),
        data: [],
    };
};

(function () {
    let result = template();

    let containsDuplicates = false;

    const isbns = [];
    const log = document.querySelector("#log");
    const files = document.querySelector("input[type='file']");

    files.addEventListener("change", function (event) {
        const reader = new FileReader();

        result = template();
        reader.onload = function (event) {
            // raw data lines
            const raw = event.target.result.toString().split("\n");

            // number of the row where column headers are
            const headerRow = parseInt(document.querySelector("#headerRow").value);

            // actual data columns; from headerRow till end
            let lines = raw.slice(headerRow);

            // column names
            let columnNames = getColumns(raw[headerRow - 1]);

            for (let i = 0; i < lines.length; i++) {
                let columns = getColumns(lines[i]);

                if (columns.length != columnNames.length) {
                    console.log("not long enough, skipping...");
                    continue;
                }

                let book = {};
                for (let col = 0; col < columnNames.length; col++) {
                    book[columnNames[col]] = columns[col];

                    let currentColumn = columnNames[col];
                    // Some checking for duplicate ISBNS
                    if (currentColumn === "isbn" && isbns.includes(columns[col])) {
                        containsDuplicates = true;

                        let isbn = columns[col] ? columns[col] : "tyhjä merkkijono";
                        let p = document.createElement("p");

                        p.classList.add("alert");
                        p.classList.add("alert-danger");

                        p.innerHTML = `Duplikaatti ISBN: ${isbn}`;

                        log.appendChild(p);
                    } else {
                        isbns.push(columns[col]);
                    }
                }

                result.data.push(book);
            }

            // This handles alternative books; it groups them as objects, i.e.
            // one alternative is one object after this mapping
            result.data = result.data.map((book) => {
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

            const a = document.querySelector("a.btn");
            if (containsDuplicates) {
                a.setAttribute("disabled", "disabled");
                a.classList.add("disabled");
            } else {
                const blob = new Blob([JSON.stringify(result, null, 2)], {
                    type: "text/json",
                });

                a.href = window.URL.createObjectURL(blob);

                // Reset the template to not to have growing amount of data in
                // same template
                result = template();
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
