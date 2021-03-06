import React, { useState, useEffect, useMemo } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import {
  Row,
  Button,
  Col,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem
} from "reactstrap";
import groupBy from "lodash/groupBy";

import NewFilter from "./newFilter";

export function SampleFilter(props) {
  const { qcApi, onFilterChange } = props;

  const [sampleFilters, setSampleFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("Global");
  const [modalOpen, setModalOpen] = useState(false);

  function updateFilters() {
    qcApi.find("filters").then(filters => {
      setSampleFilters(filters);
    });
  }

  function toggleModal(filterCreated = false) {
    setModalOpen(!modalOpen);

    if (filterCreated) updateFilters();
  }

  // The first time this is run, request the filters
  useEffect(() => {
    updateFilters();
  }, []);

  const filterGroups = useMemo(() => {
    return groupBy(sampleFilters, filter => filter.get("tag"));
  }, [sampleFilters]);

  // Whenever the filter selection changes, report back to anything listening for this event
  useEffect(() => {
    onFilterChange(selectedFilter);
  }, [selectedFilter]);

  return (
    <Card>
      <NewFilter qcApi={qcApi} isOpen={modalOpen} toggle={toggleModal} />
      <h4 className="card-header">
        Filter Samples
        <Button
          onClick={toggleModal}
          size={"sm"}
          color={"primary"}
          outline={true}
          className="float-right"
        >
          <i className="fa fa-fw fa-plus-square" aria-hidden="true" />
          Add
        </Button>
      </h4>
      <CardBody>
        <Row>
          <Col sm={3}>
            <nav
              className="nav flex-column nav-pills"
              id="sample-filter-group-select"
              role="tablist"
            >
              {Object.keys(filterGroups)
                .sort()
                .map((filterGroup, i) => {
                  return (
                    <a
                      className={classnames({
                        "nav-link": true,
                        active: filterGroup === selectedGroup
                      })}
                      href={`#sample_filter_group_${i}`}
                      key={i}
                      onClick={() => {
                        setSelectedGroup(filterGroup);
                      }}
                    >
                      {filterGroup}
                    </a>
                  );
                })}
            </nav>
          </Col>
          <Col sm={8}>
            <hr className="d-md-none" />
            <div id="sample-filter-groups">
              <ListGroup>
                <ListGroupItem
                  onClick={() => {
                    setSelectedFilter(null);
                  }}
                  tag={"button"}
                  className={classnames({
                    "sample-filter-btn": true,
                    "list-group-item-action": true,
                    active: null === selectedFilter
                  })}
                >
                  None
                </ListGroupItem>
                {selectedGroup in filterGroups &&
                  filterGroups[selectedGroup].map((filter, i) => {
                    return (
                      <ListGroupItem
                        onClick={() => {
                          setSelectedFilter(filter._getUid());
                        }}
                        key={i}
                        tag={"button"}
                        className={classnames({
                          "sample-filter-btn": true,
                          "list-group-item-action": true,
                          active: filter._getUid() === selectedFilter
                        })}
                        data-filterid={filter._getUid()}
                      >
                        {filter.get("name")}
                      </ListGroupItem>
                    );
                  })}
              </ListGroup>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

SampleFilter.propTypes = {
  qcApi: PropTypes.object,

  /**
   * Function to run when the user selects a filter. Calls the function with the
   */
  onFilterChange: PropTypes.func
};
