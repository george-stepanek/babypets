import { fetch } from 'domain-task';
import * as $ from "jquery";
declare var cloudinary: any;

export function photoUploader(urlField: string, imgField: string) {
    cloudinary.openUploadWidget({
        cloud_name: 'boop-co-nz',
        upload_preset: 'f8xxhe3n',
        sources: ['local', 'url', 'facebook', 'instagram'],
        theme: "white",
        multiple: false,
        resource_type: "image"
    },
    function (error: any, result: any) {
        if (error) {
            console.log(error.message);
        }
        else {
            $('#' + urlField).val(result[0].secure_url);
            $('#' + imgField).attr("src", result[0].secure_url);
        }
    });
}

export function sendEmail(id: number, address: string, self: any) {
    let email = { userid: id, to: address, from: $('#address').val(), message: $('#message').val() };
    let fetchTask = fetch(`api/Data/SendEmail`, { method: 'post', body: JSON.stringify(email) })
        .then(response => response.json() as Promise<any>)
        .then(data => {
            self.setState({ value: '' });
            $('#message').val('');
            alert('Email sent successfully!');
        });
}

export function formatDescription(description: string) {
    if (description) {
        // sanitise the input to guard against XSS attacks
        description = description.replace(/&/g, '&amp;')
        description = description.replace(/"/g, '&quot;')
        description = description.replace(/'/g, '&#39;')
        description = description.replace(/</g, '&lt;')
        description = description.replace(/>/g, '&gt;');

        description = description.replace(new RegExp('\n', 'g'), '<br/>');
    }
    return { __html: description };
};
