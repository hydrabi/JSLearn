function displayCitations() {
    var quotes = document.getElementsByTagName("blockquote")
    for (var i = 0; i < quotes.length; i++) {
        var cite = quotes[i].getAttribute("cite")
        if (!cite) {
            continue
        }
        var quoteChildren = quotes[i].getElementsByTagName("*")
        if (quoteChildren.length < 1) continue
        var elem = quoteChildren[quoteChildren.length - 1]

        var link = document.createElement("a")
        var link_text = document.createTextNode("source")
        link.appendChild(link_text)
        link.setAttribute("href", cite)

        var superscript = document.createElement("sup")
        superscript.appendChild(link)
        elem.appendChild(superscript)
    }
}

addloadEvent(displayCitations)