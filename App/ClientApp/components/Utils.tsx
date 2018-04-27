import { fetch } from 'domain-task';
import * as $ from "jquery";
declare var cloudinary: any;
import swal from 'sweetalert2';
import { LitterData } from "ClientApp/store/Model";
import * as React from 'react';

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
            swal({ title: "Success!", text: "The email was sent successfully.", type: "success", confirmButtonClass: 'btn btn-primary', buttonsStyling: false });
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

export function formatAge(bornOn: string) {
    var age = "";
    var days = Math.floor((new Date().getTime() - new Date(bornOn).getTime()) / (24 * 60 * 60 * 1000));

    if (days >= 365)
        age = Math.floor(days / 365) + " year" + (Math.floor(days / 365) > 1 ? "s" : "");
    else if (days >= 122)
        age = Math.floor(days / 30.5) + " month" + (Math.floor(days / 30.5) > 1 ? "s" : "");
    else if (days >= 7)
        age = Math.floor(days / 7) + " week" + (Math.floor(days / 7) > 1 ? "s" : "");
    else
        age = days + " day" + (days > 1 || days <= 0 ? "s" : "");

    return age;
}

export function calculateAvailableDates(litters: LitterData[]) {
    litters.forEach(litter => {
        litter.availableDate = new Date(litter.bornOn);
        litter.availableDate.setTime(litter.availableDate.getTime() + litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);
        litter.available = ('0' + litter.availableDate.getDate()).slice(-2) +
            "/" + ('0' + (litter.availableDate.getMonth() + 1)).slice(-2) +
            "/" + litter.availableDate.getFullYear().toString().substring(2);
    });
}

export function renderStyle(self: any, style: string) {
    const defaultStyle = ".grid-item div { background: black; } .grid-item:hover { background-color: lightgrey; } body { font-family: sans-serif; } ";
    if (self.props.location.pathname.indexOf("/user") >= 0)
        return <style type="text/css" dangerouslySetInnerHTML={{ __html: defaultStyle + style }} />;
    else
        return null;
}

export function locationSelect(self?: any, value?: string) {
    return <select name="location" id="location" className={self ? "" : "form-control"} defaultValue={value} onChange={() => { if (self) { self.filterLitters(); }}}>
        <option value="">New Zealand</option>
        <option value="Northland">Northland</option>
        <option value="Auckland">Auckland</option>
        <option value="Waikato">Waikato</option>
        <option value="Bay of Plenty">Bay of Plenty</option>
        <option value="Gisborne">Gisborne</option>
        <option value="Hawke's Bay">Hawke's Bay</option>
        <option value="Taranaki">Taranaki</option>
        <option value="Manawatu-Wanganui">Manawatu-Wanganui</option>
        <option value="Wellington">Wellington</option>
        <option value="Tasman">Tasman</option>
        <option value="Nelson">Nelson</option>
        <option value="Marlborough">Marlborough</option>
        <option value="West Coast">West Coast</option>
        <option value="Canterbury">Canterbury</option>
        <option value="Otago">Otago</option>
        <option value="Southland">Southland</option>
    </select>;
}

export function animalSelect(self?: any, value?: string) {
    return <select id="animal" name="animal" className={self ? "" : "form-control"} defaultValue={value} onChange={() => { if (self) { self.filterLitters(); }}}>
        {self ? <option value="">All Animals</option> : null}
        <option value="Cat">Cat{self ? "s" : ""}</option>
        <option value="Dog">Dog{self ? "s" : ""}</option>
        <option value="Rodent">Rodent{self ? "s" : ""}</option>
        <option value="Bird">Bird{self ? "s" : ""}</option>
        <option value="Reptile">Reptile{self ? "s" : ""}</option>
        <option value="Fish">Fish</option>
    </select>;
}
