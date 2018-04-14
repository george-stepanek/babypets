import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import { FormGroup, FormControl } from 'react-bootstrap'
import * as Validator from 'validator';
import Lightbox from 'react-images';
import { formatDescription } from './Utils';

const placeholder_image = "./img/placeholder-500.png";

type LitterProps = LitterState.LitterState & typeof LitterState.actionCreators & RouteComponentProps<{ id: string, animalid: string }>;
class Litter extends React.Component<LitterProps, {}> {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: '' };
    }
    getValidationState() {
        if ((this.state as any).value.length == 0)
            return null;
        else
            return Validator.isEmail((this.state as any).value) ? 'success' : 'error';
    }
    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    private renderCount = 0;
    componentDidUpdate(prevProps, prevState) {
        // Need to wait for the second render before we can show the modal
        if (this.renderCount == 1) {
            let animalid = parseInt(this.props.match.params.animalid);
            if (animalid) {
                this.props.showAnimal(animalid, this);
            }
        }
        this.renderCount++;
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;
        let animalid = this.props.animalid || 0;

        if (this.props.litter) {
            var animal = this.props.litter.animals.find(a => a.id == animalid);
            var socialText = this.props.litter.breed + " " + this.props.litter.animal.toLowerCase() +
                (this.props.litter.animal != "Fish" && !this.props.litter.isIndividual ? "s" : "") + " from " + this.props.litter.user.name;

            var available = new Date(this.props.litter.bornOn);
            available.setTime(available.getTime() + this.props.litter.weeksToWean * 7 * 24 * 60 * 60 * 1000);

            var images = [{ src: this.props.litter.pictureUrl ? this.props.litter.pictureUrl : placeholder_image }];
            for (var i = 0; i < this.props.litter.animals.length; i++) {
                if (this.props.litter.animals[i].pictureUrl) {
                    images.push({ src: this.props.litter.animals[i].pictureUrl })
                }
            }

            if (this.props.isLoading)
                return <div className="loading"><i className="fa fa-spinner fa-spin"></i>{this.renderStyle()}</div>;
            else
                return <div className={"columns-container row" + (this.props.location.pathname.indexOf("/user") >= 0 ? " user-page" : "")}>
                    <div className="picture-column col-sm-4">
                        <div className="picture-column-image" onClick={this.props.openGallery} title="Click for gallery of images">
                            <img id="picture" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : placeholder_image} />
                            <span className="zoom-in-icon glyphicon glyphicon-search" title="Click for gallery of images"></span>
                        </div>
                        <p className="social-share">
                            <a target="_blank" title="Tweet this"
                                href={"https://twitter.com/intent/tweet?tw_p=tweetbutton&url=http://boop.co.nz/" +
                                    (this.props.location.pathname.indexOf("/user") >= 0 ? "userlitter/" : "litter/") + this.props.litter.id +
                                    "&text=" + socialText}>
                                <i className="fa fa-twitter"></i>
                            </a>
                            <a target="_blank" title="Share this"
                                href={"https://www.facebook.com/sharer/sharer.php?u=http://boop.co.nz/" +
                                    (this.props.location.pathname.indexOf("/user") >= 0 ? "userlitter/" : "litter/") + this.props.litter.id}>
                                <i className="fa fa-facebook"></i>
                            </a>
					        <a target="_blank" title="Pin this"
                                href={"https://www.pinterest.com/pin/create/button/?url=http://boop.co.nz/" +
                                    (this.props.location.pathname.indexOf("/user") >= 0 ? "userlitter/" : "litter/") + this.props.litter.id +
                                    "&description=" + socialText + "&media=" + this.props.litter.pictureUrl}>
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
                            {this.props.litter.user.phone && this.props.litter.user.phone.length > 0 && (
                                <div>
                                    <b>Phone:</b> {this.props.litter.user.phone}
                                    <br />
                                </div>
                            )}
                            {!this.props.litter.isIndividual && (<div>
                                <b>Born:</b> {this.formatDateString(new Date(this.props.litter.bornOn))}
                                <br />
                            </div>)}
                            {this.props.litter.isIndividual && (<div>
                                <b>Gender:</b> {this.props.litter.animals[0].isFemale ? "Female" : "Male"}
                                <br />
                            </div>)}
                            <b>Available:</b> {this.formatDateString(available)}
                            <br />
                            {this.props.litter.isIndividual && (<div>
                                <b>Status:</b> {this.props.litter.animals[0].sold ? "Placed" : (this.props.litter.animals[0].hold ? "On Hold" : "Available")}
                                <br />
                            </div>)}
                            <b>Price:</b> {"$" + this.props.litter.price.toFixed(2)}
                            <br />
                            <b>Deposit:</b> {"$" + this.props.litter.deposit.toFixed(2)}
                        </p>
                        <div className="buttons edit-button">
                            {this.props.userid == this.props.litter.userId && !(this.props.location.pathname.indexOf("/user") >= 0) && (
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    this.props.history.push((this.props.litter.isIndividual ? '/editanimal/' : '/editlitter/') + this.props.litter.id);
                                }}>Edit</button>
                            )}
                            {this.props.userid != this.props.litter.userId && !(this.props.location.pathname.indexOf("/user") >= 0) && (
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    this.props.history.push('/seller/' + this.props.litter.userId);
                                }}>Seller</button>
                            )}
                            {this.props.location.pathname.indexOf("/user") >= 0 && (
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    this.props.history.goBack();
                                }}>Back</button>
                            )}
                        </div>
                        <p dangerouslySetInnerHTML={formatDescription(this.props.litter.description)} />
                    </div>
                    {!this.props.litter.isIndividual && (
                        <div className="grid-column col-sm-4">{this.renderGrid()}</div>
                    )}
                    {this.props.litter.isIndividual && !this.props.litter.animals[0].hold && !this.props.litter.animals[0].sold && (
                        <div className="grid-column col-sm-4">
                            <FormGroup validationState={this.getValidationState()}>
                                <FormControl type="text" id="address" value={(this.state as any).value} placeholder="Your email address" onChange={this.handleChange} />
                                <FormControl.Feedback />
                            </FormGroup>
                            <div className="buttons">
                                <button type="button" className="btn btn-success"
                                    onClick={() => { this.props.holdAnimal(this.props.litter.animals[0].id, this); }}
                                    disabled={!Validator.isEmail((this.state as any).value)}
                                    title={Validator.isEmail((this.state as any).value) ? "" : "Email address required"}>
                                    {this.props.litter.deposit > 0 ? "Pay Deposit & Hold" : "Express Interest"}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="modal fade" id="animal-modal" role="dialog" key={animalid}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="picture-column-image">
                                        <img id='animal-placeholder' src={animalid > 0 && animal.pictureUrl ? animal.pictureUrl : placeholder_image}></img>
                                    </div>
                                    <p>
                                        <b>Gender:</b> {animalid > 0 ? (animal.isFemale ? "Female" : "Male") : ""}
                                        <br />
                                        <b>Status:</b> {animalid > 0 ? (animal.sold ? "Placed" : (animal.hold ? "On Hold" : "Available")) : ""}
                                        <br />
                                        <b>Price:</b> ${animalid > 0 ? (animal.priceOverride > 0 ? animal.priceOverride.toFixed(2) : this.props.litter.price.toFixed(2)) : "0.00"}
                                    </p>
                                    <p dangerouslySetInnerHTML={formatDescription(animalid > 0 ? animal.description : "")} />
                                </div>
                                <div className="modal-footer">
                                    {animalid > 0 && !animal.hold && !animal.sold && (
                                        <FormGroup validationState={this.getValidationState()}>
                                            <FormControl type="text" id="address" value={(this.state as any).value} placeholder="Your email address" onChange={this.handleChange} />
                                            <FormControl.Feedback />
                                        </FormGroup>
                                    )}
                                    <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
                                    {animalid > 0 && !animal.hold && !animal.sold && (
                                        <button type="button" className="btn btn-success"
                                            onClick={() => { this.props.holdAnimal(animalid, this); }}
                                            disabled={!Validator.isEmail((this.state as any).value)}
                                            title={Validator.isEmail((this.state as any).value) ? "" : "Email address required"}>
                                            {this.props.litter.deposit > 0 ? "Pay Deposit & Hold" : "Express Interest"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderStyle()}
                </div>;
        }
        else return <div />;
    }

    private renderStyle() {
        const defaultStyle = ".grid-item div { background: black; } .grid-item:hover { background-color: lightgrey; } body { font-family: sans-serif; } ";
        if (this.props.location.pathname.indexOf("/user") >= 0)
            return <style type="text/css" dangerouslySetInnerHTML={{ __html: defaultStyle + this.props.litter.user.style }} />;
        else
            return <div />;
    }

    private formatDateString(date: Date) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var day = ('0' + date.getDate()).slice(-2);
        var month = monthNames[date.getMonth()];
        return day + " " + month + " " + date.getFullYear();
    }

    private renderGrid() {
        return <div>
            {this.props.litter.animals.map(animal =>
                <div className="grid-item" key={animal.id} onClick={() => { this.props.showAnimal(animal.id, this) }}>
                    <div><img src={animal.pictureUrl ? animal.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image} /></div>
                    <b>{animal.isFemale ? "Female" : "Male"}</b>
                    <br />
                    {animal.priceOverride > 0 ? "$" + animal.priceOverride.toFixed(0) + " " : ""}
                    <i>{animal.sold ? "Placed" : (animal.hold ? "On Hold" : "Available")}</i>
                </div>
            )}
        </div>;
   }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litter) as typeof Litter;