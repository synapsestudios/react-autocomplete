var configurations = {
    '1' : {
        font   : 'bold 10px "helvetica", sans-serif',
        offset : 3,
        width  : 10
    },
    '2' : {
        font   : 'bold 10px "helvetica", sans-serif',
        offset : 2,
        width  : 14
    },
    '3' : {
        font   : 'bold 9px "helvetica", sans-serif',
        offset : 1,
        width  : 16
    }
};

function favicon(content) {
    var canvas, context, digits, image, link, settings;

    canvas = document.createElement('canvas');
    image  = document.createElement('img');
    link   = document.getElementById('favicon');

    if (canvas.getContext) {
        canvas.height = 16;
        canvas.width  = 16;

        context = canvas.getContext('2d');
        digits  = content.toString().length;

        if (digits > 3) {
            digits = 3;
        }

        settings = configurations[digits];

        image.onload = function() {
            context.drawImage(this, 0, 0);

            // Draw rectangle
            if (content) {
                context.beginPath();
                context.lineWidth   = 1;
                context.strokeStyle = '#330000';
                context.rect(1, 1, settings.width, 10);
                context.stroke();

                context.fillStyle = '#FF0000';
                context.fill();

                // Draw text
                context.font      = settings.font;
                context.fillStyle = 'white';
                context.fillText(content, settings.offset, 10); 
            }

            link.href = canvas.toDataURL('image/png');
        };

        image.src = 'favicon.png';
    }
}
