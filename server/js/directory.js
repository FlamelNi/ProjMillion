
function get_template_HTML(f) {
    getTxt = function (){
        $.ajax({
            // url:'/js/index.js',
            url:'static/index.html',
            success: function (data) {
                f(data);
            }
        });
    }
    getTxt();
}

function get_template_CSS(f) {
    getTxt = function (){
        $.ajax({
            url:'static/index.css',
            success: function (data) {
                f(data);
            }
        });
    }
    getTxt();
}


function get_template_files(filenames, curr_zip, f) {
    f_name = filenames.pop();
    getTxt = function (){
        $.ajax({
            url:`static/${f_name}`,
            success: function (data) {
                curr_zip.file(f_name, data);
                if (filenames.length > 0) {
                    get_template_files(filenames, curr_zip, f);
                } else {
                    f(data);
                }
            }
        });
    }
    getTxt();
}

function get_template_file(filename, f) {
    getTxt = function (){
        $.ajax({
            url:`static/${filename}`,
            success: function (data) {
                f(data);
            }
        });
    }
    getTxt();
}

function export_directory_js(curr_zip) {
    // result = 
    // `
        


    // `;

    curr_zip.file("main.js", result);
    // return result;
}



