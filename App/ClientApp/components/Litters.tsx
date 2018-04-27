import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as LittersState from '../store/Litters';
import * as $ from "jquery";
import { animalSelect, locationSelect, formatAge, calculateAvailableDates, renderStyle } from './Utils';
import { ThumbLitter } from './ThumbLitter';

const pageSize = 20;
const placeholder_image = "./img/placeholder-500.png";

type LittersProps = LittersState.LittersState & typeof LittersState.actionCreators & RouteComponentProps<{ id: string }>;
class Litters extends React.Component<LittersProps, {}> {
    componentWillMount() {
        if (this.props.location.hash.search('#_=_') >= 0) {
            this.props.history.push('/');
        }
        this.props.requestLitters(this.props.match.params.id, 0, "", "", this);
    }

    filterLitters(page?: number)
    {
        this.props.requestLitters(this.props.match.params.id, page ? page : 0, $("#animal").val() as string, $("#location").val() as string, this);
    }

    public render() {
        calculateAvailableDates(this.props.litters);

        return <div className="litters-grid">
            {!this.props.match.params.id && (
                <p>
                    <span className={this.props.page > 0 ? "paging" : "disabled"} title={"Previous " + pageSize} onClick={() => {
                        if (this.props.page > 0) this.filterLitters(this.props.page - 1);
                    }}><span className="glyphicon glyphicon-backward"></span> </span>
                    {animalSelect(this)}&nbsp;in&nbsp;
                    {locationSelect(this)}
                    <span className={this.props.litters.length > pageSize ? "paging" : "disabled"} title={"Next " + pageSize} onClick={() => {
                        if (this.props.litters.length > pageSize) this.filterLitters(this.props.page + 1);
                    }}> <span className="glyphicon glyphicon-forward"></span></span>
                </p>
            )}
            {this.renderGrid()}
            {renderStyle(this, this.props.litters.length > 0 ? this.props.litters[0].user.style : (this.props.seller ? this.props.seller.style : ""))}
        </div>;
    }

    private renderGrid() {
        if (this.props.isLoading)
            return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
        else
            return <div key={this.props.userid}>
                {this.props.litters.map((litter, index) =>
                    (this.props.litters.length <= pageSize || index < this.props.litters.length - 1) || this.props.match.params.id ?
                        <ThumbLitter litter={litter} location={litter.user.location} to={location.href.indexOf('user') > 0 ? 'userlitter' : 'litter'} />
                    : <div />
                )}
            </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.litters, // Selects which state properties are merged into the component's props
    LittersState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litters) as typeof Litters;
