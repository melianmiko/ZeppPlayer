export class TextToLines {
    static withEllipsis(context, config) {
        const offsetX = config.char_space ? config.char_space : 0;

        let preLines = config.text.toString().split("\n"),
            currentLine = -1,
            lines = [];

        for (let i in preLines) {
            let data = preLines[i];
            currentLine++;

            while (data !== "") {
                if (!lines[currentLine]) lines[currentLine] = "";

                const newLine = lines[currentLine] += data[0];
                const width = context.measureText(newLine).width + (offsetX * (newLine.length - 1));

                if (width < config.w - 20) {
                    data = data.substring(1);
                } else {
                    lines[currentLine] += "..";
                    console.log(lines[currentLine])
                    data = "";
                }
            }
        }

        return lines;
    }

    static withWrap(context, config) {
        const offsetX = config.char_space ? config.char_space : 0;

        let preLines = config.text.toString().split("\n");

        let currentLine = -1,
            lines = [],
            width,
            word,
            newLine;

        for (let i in preLines) {
            let data = preLines[i];
            currentLine++;

            while (data !== "") {
                if (!lines[currentLine]) lines[currentLine] = "";

                if (config.text_style === 2) {
                    // Per word
                    word = data.indexOf(" ") >= 0 ? data.substring(0, data.indexOf(" ") + 1) : data;
                } else if (config.text_style === 1) {
                    // Per-symbol
                    word = data[0];
                }

                newLine = lines[currentLine] + word;
                width = context.measureText(newLine).width + (offsetX * (newLine.length - 1));
                if ((width < config.w || lines[currentLine].length === 0)) {
                    while (context.measureText(word).width > config.w && word.length > 1) {
                        word = word.substring(0, word.length - 1);
                    }
                    lines[currentLine] += word;
                    data = data.substring(word.length);
                } else {
                    currentLine++;
                }
            }
        }

        return lines;
    }

    static perform(context, config) {
        if(config.w) switch (config.text_style) {
            case 3:
                return TextToLines.withEllipsis(context, config);
            case 2:
            case 1:
                return TextToLines.withWrap(context, config);
        }

        return config.text.toString().split("\n");
    }
}
