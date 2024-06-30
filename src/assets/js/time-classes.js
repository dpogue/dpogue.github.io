if (document.body.classList) {
    document.body.classList.add("date-" + (new Date()).toISOString().substr(0, 10));
}
