import * as React from 'react';
import { Link } from 'react-router-dom';
import { LitterData } from "ClientApp/store/Model";
import { formatAge } from './Utils'

const placeholder_image = "./img/placeholder-500.png";

export class ThumbLitter extends React.Component<{ litter: LitterData, location: string, to: string }, {}> {
    public render() {
        return <div className="grid-item" key={this.props.litter.id}>
            <Link to={'/' + this.props.to + '/' + this.props.litter.id}>
                <div>
                    <img src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} />
                </div>
                {this.props.litter.breed}
                <br />
                {this.props.location}
                <br />
                <i>
                    {this.props.litter.isIndividual ? (this.props.litter.animals[0].sold ? "Has been placed" : (this.props.litter.animals[0].hold ? "On hold" : formatAge(this.props.litter.bornOn) + " old")) :
                        (new Date() >= this.props.litter.availableDate) ? formatAge(this.props.litter.bornOn) + " old" : "Ready " + this.props.litter.available}
                </i>
                <br />
                {"$" + Math.floor(this.props.litter.price).toFixed(0)}
            </Link>
        </div>;
    }
}
