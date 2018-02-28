﻿import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import Lightbox from 'react-images';

const placeholder_image = "./img/placeholder-500.png";

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string }>;
class Litter extends React.Component<LitterProps, {}> {
    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;
        let animalid = this.props.animalid || 0;

        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == animalid);

            var available = new Date(this.props.litter.bornOn);
            available.setTime(available.getTime() + this.props.litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);

            var images = [{ src: this.props.litter.pictureUrl ? this.props.litter.pictureUrl : placeholder_image }];
            for (var i = 0; i < this.props.litter.animals.length; i++) {
                if (this.props.litter.animals[i].pictureUrl) {
                    images.push({ src: this.props.litter.animals[i].pictureUrl })
                }
            }
            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
            else
                return <div className={"columns-container row" + (window.location.href.indexOf("/user") > 0 ? " user-page" : "")}>
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image" onClick={this.props.openGallery} title="Click for gallery of images">
                            <img id="picture" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : placeholder_image} />
                            <span className="zoom-in-icon glyphicon glyphicon-search" title="Click for gallery of images"></span>
                        </div>
                        <p className="social-share">
                            <a target="_blank" title="Share it"
                                href={"https://www.facebook.com/sharer/sharer.php?u=" + window.location.href}>
                                <i className="fa fa-facebook"></i>
                            </a>
                            <a target="_blank" title="Tweet it"
                                href={"https://twitter.com/intent/tweet?tw_p=tweetbutton&url=" + window.location.href +
                                    "&text=" + this.props.litter.breed}>
                                <i className="fa fa-twitter"></i>
                            </a>
					        <a target="_blank" title="Pin it"
                                href={"https://www.pinterest.com/pin/create/button/?url=" + window.location.href +
                                    "&description=" + this.props.litter.breed + "&media=" + this.props.litter.pictureUrl}>
                                <i className="fa fa-pinterest"></i>
                            </a>
                        </p>
                   </div>
                    <Lightbox
                        images={images}
                        isOpen={this.props.current != undefined}
                        currentImage={this.props.current}
                        backdropClosesModal={true}
                        showThumbnails={true}
                        showImageCount={false}
                        onClose={this.props.closeGallery}
                        onClickNext={this.props.nextImage}
                        onClickPrev={this.props.prevImage}
                        onClickThumbnail={this.props.goImage}
                    />
                    <div className="details-column col-sm-4">
                        <p>
                            <b>{this.props.litter.animal}:</b> {this.props.litter.breed}
                            <br />
                            <b>Region:</b> {this.props.litter.user.location}
                            <br />
                            <b>Contact:</b> {this.props.litter.user.name}
                            <br />
                            <b>Phone:</b> {this.props.litter.user.phone}
                            <br />
                            <b>Born:</b> {this.formatDateString(new Date(this.props.litter.bornOn))}
                            <br />
                            <b>Available:</b> {this.formatDateString(available)}
                            <br />
                            <b>Price:</b> {"$" + this.props.litter.price.toFixed(2)}
                            <br />
                            <b>Deposit:</b> {"$" + this.props.litter.deposit.toFixed(2)}
                        </p>
                        <div className="buttons edit-button">
                            {this.props.userid == this.props.litter.userId && !(window.location.href.indexOf("/user") > 0) && (
                                <button type="button" className="btn btn-primary" onClick={() => { this.props.history.push('/editlitter/' + this.props.litter.id); }}>Edit</button>
                            )}
                        </div>
                        <div className="buttons edit-button">
                            {(this.props.userid != this.props.litter.userId || window.location.href.indexOf("/user") > 0) && (
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    this.props.history.push((window.location.href.indexOf("/user") > 0 ? '/user/' : '/seller/') + this.props.litter.userId);
                                }}>Seller</button>
                            )}
                        </div>
                        <p dangerouslySetInnerHTML={this.formatDescription(this.props.litter.description)} />
                    </div>
                    <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                    <div className="modal fade" id="animal-modal" role="dialog" key={animalid}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="picture-column-image">
                                        <img id='animal-placeholder' src={animalid > 0 && animal.pictureUrl ? animal.pictureUrl : placeholder_image}></img>
                                    </div>
                                    <p>
                                        <b>Gender:</b> {animalid > 0 ? (animal.isFemale ? "Female" : "Male") : ""}
                                        <br />
                                        <b>Status:</b> {animalid > 0 ? (animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")) : ""}
                                        <br />
                                        <b>Price:</b> ${animalid > 0 ? (animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : this.props.litter.price.toFixed(2)) : "0.00"}
                                    </p>
                                    <p dangerouslySetInnerHTML={this.formatDescription(animalid > 0 ? animal.description : "")} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>;
        }
        else return <div />;
    }

    private formatDateString(date: Date) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var day = ('0' + date.getDate()).slice(-2);
        var month = monthNames[date.getMonth()];
        return day + " " + month + " " + date.getFullYear();
    }

    private formatDescription(description: string) {
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

    private renderGrid() {
        return <div>
            {this.props.litter.animals.map(animal =>
                <div className="grid-item" key={animal.id} onClick={() => { this.props.showAnimal(animal.id, this) }}>
                    <div><img src={animal.pictureUrl ? animal.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} /></div>
                    <b>{animal.isFemale ? "Female" : "Male"}</b>
                    <br />
                    {animal.priceOverride > 0 ? "$" + animal.priceOverride.toFixed(0) + " " : ""}
                    <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
                </div>
            )}
        </div>;
   }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litter) as typeof Litter;