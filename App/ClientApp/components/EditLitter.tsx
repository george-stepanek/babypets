import * as React from 'react';
import { NavLink, Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as LitterState from '../store/Litter';

// At runtime, Redux will merge together...
type LitterProps =
    LitterState.LitterState        // ... state we've requested from the Redux store
    & typeof LitterState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ id: string }>; // ... plus incoming routing parameters

export function formatDateString(date: Date) {
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var day = ('0' + date.getDate()).slice(-2);
    var month = monthNames[date.getMonth()];
    return day + " " + month + " " + date.getFullYear();
}

class EditLitter extends React.Component<LitterProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        let id = parseInt(this.props.match.params.id) || 0;
        this.props.requestLitter(id);
    }

    public render() {
        if (this.props.litter) {
            return <div className="litter-grid row">
                <div className="litter-pic col-sm-4">
                    <div className="litter-pic-content">
                        <img src={this.props.litter.pictureUrl ? this.props.litter.pictureUrl : "https://www.mikkis.co.uk/themes/responsive/images/placeholder-500.png"} />
                    </div>
                    <div>
                        <input defaultValue={this.props.litter.pictureUrl}></input>
                    </div>
               </div>
                <div className="litter-details col-sm-4">
                    <p>
                        <b>Animal:</b>
                        <br />
                        <select name="animal" defaultValue={this.props.litter.animal}>
                            <option value="cat">Cat</option>
                            <option value="dog">Dog</option>
                            <option value="rodent">Rodent</option>
                        </select>                        
                        <br />
                        <b>Breed:</b>
                        <br />
                        <input defaultValue={this.props.litter.breed}></input>
                        <br />
                        <b>Born:</b>
                        <br />
                        <input defaultValue={formatDateString(new Date(this.props.litter.bornOn))}></input>
                        <br />
                        <b>Weeks until ready:</b>
                        <br />
                        <input defaultValue={this.props.litter.weeksToWean.toString()}></input>
                        <br />
                        <b>Price:</b>
                        <br />
                        <input defaultValue={this.props.litter.price.toFixed(2)}></input>
                        <br />
                        <b>Deposit:</b>
                        <br />
                        <input defaultValue={this.props.litter.deposit.toFixed(2)}></input>
                        <br />
                        <b>Description:</b>
                        <br />
                        <textarea rows={10} defaultValue={this.props.litter.description}></textarea>
                        <NavLink exact to={'/litter/' + this.props.litter.id}>
                            <button type="button" className="btn"><span className='glyphicon glyphicon-save'></span> Save</button>
                        </NavLink>
                   </p>
                </div>
                <div className="animals-grid col-sm-4">{this.renderGrid()}</div>
            </div>;
        }
        else
            return <div></div>;
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
