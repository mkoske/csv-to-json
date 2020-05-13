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

  const bookTemplate = {
    isbn: "",
    title: "",
    author: "",
    updated: "",
    coverImageUrl: "",
    ageGroup: "",
    themes: [],
    description: "",
    availabilityUrl: "",
    alternatives: [],
    additionalInformation: "",
    helpText: "",
  };

  const isbns = [];
  let containsDuplicates = false;
  const log = document.querySelector(".log");
  const files = document.querySelector("input[type='file']");
  files.addEventListener("change", function (event) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split("\n");

      // These are some header lines
      lines.shift();
      lines.shift();

      for (let i = 0; i < lines.length; i++) {
        const element = lines[i];
        let columns = element.split("\t");
        if (columns.length !== 14) {
          continue;
        }

        // Trim spaces
        columns = columns.map(function (column) {
          return column.trim();
        });

        // This copies or clones bookTemplate object
        let book = JSON.parse(JSON.stringify(bookTemplate));

        if (isbns.includes(columns[0])) {
          let p = document.createElement("p");
          p.appendChild(document.createTextNode(columns[0]));
          log.appendChild(p);
          containsDuplicates = true;
        } else {
          isbns.push(columns[0]);
        }

        book.isbn = columns[0];
        book.title = columns[1];
        book.author = columns[2];
        book.updated = columns[3] ? columns[3] : new Date().toISOString();
        book.coverImageUrl = columns[4];

        // Force HTTPS
        if (/^http:/.test(book.coverImageUrl)) {
          book.coverImageUrl = book.coverImageUrl.replace("http:", "https:");
        }

        book.ageGroup = columns[5].split(",").map(function (item) {
          return item.trim();
        });

        book.themes = columns[6].split(",").map(function (item) {
          return item.trim();
        });

        book.description = columns[7];
        book.availabilityUrl = columns[8];

        book.additionalInformation = columns[9];
        book.helpText = columns[10];

        // TODO: This could be just looped over from 10 to 12, inclusive
        let alternative = [];

        if (columns[11] != "") {
          alternative = columns[11].split(";");
          book.alternatives.push({
            alternativeLabel: alternative[0],
            alternativeAvailabilityUrl: alternative[1],
          });
        }

        if (columns[12] != "") {
          alternative = columns[12].split(";");
          book.alternatives.push({
            alternativeLabel: alternative[0],
            alternativeAvailabilityUrl: alternative[1],
          });
        }

        if (columns[13] != "") {
          alternative = columns[13].split(";");
          book.alternatives.push({
            alternativeLabel: alternative[0],
            alternativeAvailabilityUrl: alternative[1],
          });
        }

        result.books.books.push(book);
      }

      if (containsDuplicates) {
        alert("Sisältää duplikaatteja! Ei voida luoda JSON-tiedostoa.");
      } else {
        const blob = new Blob([JSON.stringify(result, null, 2)], {
          type: "text/json",
        });

        const a = document.querySelector("a.button");
        a.href = window.URL.createObjectURL(blob);
      }
    };

    reader.readAsText(event.target.files[0]);
  });

  const button = document.querySelector("a.button");
  button.addEventListener("click", function (event) {
    const element = event.target;
    const href = element.getAttribute("href");
    if (href.length < 1) {
      event.preventDefault();
    }
  });
})();
