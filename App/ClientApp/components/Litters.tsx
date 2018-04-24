﻿import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as LittersState from '../store/Litters';
import * as $ from "jquery";
import { formatAge, calculateAvailableDates } from './Utils';

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
                    <select id="animal" name="animal" onChange={() => { this.filterLitters() }}>
                        <option value="">All Animals</option>
                        <option value="Cat">Cats</option>
                        <option value="Dog">Dogs</option>
                        <option value="Rodent">Rodents</option>
                        <option value="Bird">Birds</option>
                        <option value="Reptile">Reptiles</option>
                        <option value="Fish">Fish</option>
                    </select>&nbsp;in&nbsp;
                    <select name="location" id="location" style={{ "width" : "130px" }} onChange={() => { this.filterLitters() }}>
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
                    </select>
                    <span className={this.props.litters.length > pageSize ? "paging" : "disabled"} title={"Next " + pageSize} onClick={() => {
                        if (this.props.litters.length > pageSize) this.filterLitters(this.props.page + 1);
                    }}> <span className="glyphicon glyphicon-forward"></span></span>
                </p>
            )}
            {this.renderGrid()}
            {this.renderStyle()}
        </div>;
    }

    private renderGrid() {
        if (this.props.isLoading)
            return <div className="loading"><i className="fa fa-spinner fa-spin"></i></div>;
        else
            return <div key={this.props.userid}>
                {this.props.litters.map((litter, index) =>
                    (this.props.litters.length <= pageSize || index < this.props.litters.length - 1) || this.props.match.params.id ?
                        <div className="grid-item" key={litter.id}>
                            <Link to={(location.href.indexOf('user') > 0 ? '/userlitter/' : '/litter/') + litter.id}>
                                <div>
                                    <img src={litter.pictureUrl ? litter.pictureUrl.replace('/upload/', '/upload/c_fill,h_128,w_128/') : placeholder_image } />
                                </div>
                                {litter.breed}
                                <br />
                                {litter.user.location}
                                <br />
                                <i>
                                    {litter.isIndividual ? (litter.animals[0].sold ? "Has been placed" : (litter.animals[0].hold ? "On hold" : formatAge(litter.bornOn) + " old")) :
                                        (new Date() >= litter.availableDate) ? formatAge(litter.bornOn) + " old" : "Ready " + litter.available}
                                </i>
                                <br />
                                {"$" + Math.floor(litter.price).toFixed(0)}
                            </Link>
                        </div>
                    : <div />
                )}
            </div>;
    }

    private renderStyle() {
        const defaultStyle = ".grid-item div { background: black; } .grid-item:hover { background-color: lightgrey; } body { font-family: sans-serif; } ";
        if (this.props.location.pathname.indexOf("/user") >= 0)
            return <style type="text/css" dangerouslySetInnerHTML={{
                __html: defaultStyle + (this.props.litters.length > 0 ? this.props.litters[0].user.style : (this.props.seller ? this.props.seller.style : ""))
            }} />;
        else
            return <div />;
    }
}

export default connect(
    (state: ApplicationState) => state.litters, // Selects which state properties are merged into the component's props
    LittersState.actionCreators                 // Selects which action creators are merged into the component's props
)(Litters) as typeof Litters;
