import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';
import * as $ from "jquery";
import * as DatePicker from "react-bootstrap-date-picker";

// At runtime, Redux will merge together...
type LitterProps =
    LitterState.LitterState        // ... state we've requested from the Redux store
    & typeof LitterState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ id: string }>; // ... plus incoming routing parameters

class EditLitter extends React.Component<LitterProps, {}> {
    private placeholder_image = "https://www.mikkis.co.uk/themes/responsive/images/placeholder-500.png";

    componentWillMount() {
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }   

    componentDidMount() {
        var showPhoto = function () { $('#picture').attr("src", $('#pictureUrl').val() as string); };
        $('#pictureUrl')
            .change(showPhoto)
            .keyup(showPhoto)
            .bind('paste', showPhoto);

        var self = this;
        $('#picture').on('error', function () {
            $('#picture').attr("src", self.placeholder_image);
        });
    }

    public render() {
        let id = parseInt(this.props.match.params.id) || 0;
        if (this.props.litter) {
            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <div className="litter-pic-content">
                        <img id="picture" src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : this.placeholder_image} />
                    </div>
                    <div>
                        <input id="pictureUrl" defaultValue={id > 0 ? this.props.litter.pictureUrl : ""}></input>
                    </div>
               </div>
                <div className="litter-details col-sm-4">
                    <b>Animal:</b>
                    <br />
                    <select id="animal" name="animal" defaultValue={this.props.litter.animal}>
                        <option value="cat">Cat</option>
                        <option value="dog">Dog</option>
                        <option value="rodent">Rodent</option>
                    </select>                        
                    <br />
                    <b>Breed:</b>
                    <br />
                    <input id="breed" defaultValue={id > 0 ? this.props.litter.breed : ""}></input>
                    <br />
                    <b>Born:</b>
                    <br />
                    <DatePicker className="date-picker" value={new Date(this.props.litter.bornOn).toISOString()}></DatePicker>
                    <b>Weeks until ready:</b>
                    <br />
                    <input id="weeksToWean" type="number" defaultValue={this.props.litter.weeksToWean.toString()}></input>
                    <br />
                    <b>Price:</b>
                    <br />
                    <input id="price" type="number" defaultValue={this.props.litter.price.toFixed(2)}></input>
                    <br />
                    <b>Deposit:</b>
                    <br />
                    <input id="deposit" type="number" defaultValue={this.props.litter.deposit.toFixed(2)}></input>
                    <br />
                    <b>Description:</b>
                    <br />
                    <textarea id="description" rows={10} defaultValue={id > 0 ? this.props.litter.description : ""}></textarea>
                    <NavLink exact to={'/litter/' + this.props.litter.id}>
                        <button type="button" className="btn" onClick={() => { this.props.saveLitter(id) }}>
                            Save <span className='glyphicon glyphicon-ok'></span>
                        </button>
                    </NavLink>
                    <NavLink exact to={'/litter/' + this.props.litter.id}>
                        <button type="button" className="btn">
                            Cancel <span className='glyphicon glyphicon-remove'></span>
                        </button>
                    </NavLink>
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
            </div>;
        }
        else
            return <div/>;
    }

    private renderGrid() {
        if (this.props.litter)
            return <div>
                {this.props.litter.animals.map(animal =>
                    <div className="grid-item" key={animal.id}>
                        <Link to={'/animal/' + animal.id}>
                            <div><img src={animal.pictureUrl} /></div>
                            <b>{animal.isFemale ? "Female" : "Male"}</b>
                            <br />
                            <i>{animal.sold ? "Sold" : (animal.hold ? "On Hold" : "For Sale")}</i>
                            <br />
                            {animal.description}
                        </Link>
                    </div>
                )}
            </div>;
        else
            return <div></div>;
    }
}

export default connect(
    (state: ApplicationState) => state.litter, // Selects which state properties are merged into the component's props
    LitterState.actionCreators                 // Selects which action creators are merged into the component's props
)(EditLitter) as typeof EditLitter;
