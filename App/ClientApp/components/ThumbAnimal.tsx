import * as React from 'react';
import { AnimalData } from "ClientApp/store/Model";

const placeholder_image = "./img/placeholder-500.png";

export class ThumbAnimal extends React.Component<{ animal: AnimalData, showAnimal: any, self: any }, {}> {
    public render() {
        return <div className="grid-item" key={this.props.animal.id} onClick={() => { this.props.showAnimal(this.props.animal.id, self) }}>
            <div><img src={this.props.animal.pictureUrl ? this.props.animal.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} /></div>
            <b>{this.props.animal.isFemale ? "Female" : "Male"}</b>
            <br />
            {this.props.animal.priceOverride > 0 && !this.props.animal.sold && !this.props.animal.sold ? "$" + this.props.animal.priceOverride.toFixed(0) + " " : ""}
            <i>{this.props.animal.sold ? "Has been placed" : (this.props.animal.hold ? "On hold" : "Available")}</i>
        </div>;
    }
}
