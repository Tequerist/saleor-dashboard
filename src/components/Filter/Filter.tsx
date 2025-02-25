import { ClickAwayListener, Grow, Popper, Typography } from "@material-ui/core";
import { alpha } from "@material-ui/core/styles";
import { Button, makeStyles } from "@saleor/macaw-ui";
import classNames from "classnames";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { FilterContent } from ".";
import {
  FilterElement,
  FilterErrorMessages,
  IFilter,
  InvalidFilters,
} from "./types";
import useFilter from "./useFilter";
import { extractInvalidFilters } from "./utils";

export interface FilterProps<TFilterKeys extends string = string> {
  currencySymbol?: string;
  errorMessages?: FilterErrorMessages<TFilterKeys>;
  menu: IFilter<TFilterKeys>;
  onFilterAdd: (filter: Array<FilterElement<string>>) => void;
  onFilterAttributeFocus?: (id?: string) => void;
}

const useStyles = makeStyles(
  theme => ({
    addFilterButton: {
      "&$filterButton": {
        "&:hover, &:focus": {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        },
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}`,
        cursor: "pointer",
        marginBottom: 0,
        marginRight: theme.spacing(2),
        marginTop: 0,
        transition: theme.transitions.duration.short + "ms",
      },
    },
    addFilterButtonActive: {
      "&$addFilterButton": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
    addFilterIcon: {
      transition: theme.transitions.duration.short + "ms",
    },
    addFilterText: {
      color: theme.palette.primary.main,
      fontSize: 14,
      fontWeight: 600 as 600,
      textTransform: "uppercase",
    },
    filterButton: {
      padding: theme.spacing(1, 2),
      marginRight: theme.spacing(2),
    },
    paper: {
      "& p": {
        paddingBottom: 10,
      },
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      width: 240,
    },
    popover: {
      width: 376,
      zIndex: 3,
    },
    rotate: {
      transform: "rotate(180deg)",
    },
    separator: {
      backgroundColor: theme.palette.primary.main,
      display: "inline-block",
      height: 14,
      margin: theme.spacing(0, 1.5, 0, 1),
      width: 1,
    },
  }),
  { name: "Filter" },
);
const Filter: React.FC<FilterProps> = props => {
  const {
    currencySymbol,
    menu,
    onFilterAdd,
    onFilterAttributeFocus,
    errorMessages,
  } = props;
  const classes = useStyles(props);

  const anchor = React.useRef<HTMLDivElement>();
  const [isFilterMenuOpened, setFilterMenuOpened] = useState(false);
  const [filterErrors, setFilterErrors] = useState<InvalidFilters<string>>({});
  const [data, dispatch, reset] = useFilter(menu);

  const isFilterActive = menu.some(filterElement => filterElement.active);

  const handleSubmit = () => {
    const invalidFilters = extractInvalidFilters(data, menu);

    if (Object.keys(invalidFilters).length > 0) {
      setFilterErrors(invalidFilters);
      return;
    }

    setFilterErrors({});
    onFilterAdd(data);
    setFilterMenuOpened(false);
  };

  const handleClear = () => {
    reset();
    setFilterErrors({});
  };

  return (
    <ClickAwayListener
      onClickAway={event => {
        if ((event.target as HTMLElement).getAttribute("role") !== "option") {
          setFilterMenuOpened(false);
        }
      }}
      mouseEvent="onMouseUp"
    >
      <div ref={anchor}>
        <Button
          className={classNames(classes.filterButton, {
            [classes.addFilterButtonActive]:
              isFilterMenuOpened || isFilterActive,
          })}
          onClick={() => setFilterMenuOpened(!isFilterMenuOpened)}
          data-test-id="show-filters-button"
          variant="secondary"
        >
          <Typography className={classes.addFilterText}>
            <FormattedMessage
              id="FNpv6K"
              defaultMessage="Filters"
              description="button"
            />
          </Typography>
          {isFilterActive && (
            <>
              <span className={classes.separator} />
              <Typography className={classes.addFilterText}>
                {menu.reduce((acc, filterElement) => {
                  const dataFilterElement = data.find(
                    ({ name }) => name === filterElement.name,
                  );

                  if (!dataFilterElement) {
                    return acc;
                  }

                  return acc + (dataFilterElement.active ? 1 : 0);
                }, 0)}
              </Typography>
            </>
          )}
        </Button>
        <Popper
          className={classes.popover}
          open={isFilterMenuOpened}
          anchorEl={anchor.current}
          transition
          disablePortal
          placement="bottom-start"
          modifiers={{
            flip: {
              enabled: false,
            },
            hide: {
              enabled: false,
            },
            preventOverflow: {
              boundariesElement: "scrollParent",
              enabled: false,
            },
          }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "right top" : "right bottom",
              }}
            >
              <FilterContent
                errorMessages={errorMessages}
                errors={filterErrors}
                dataStructure={menu}
                currencySymbol={currencySymbol}
                filters={data}
                onClear={handleClear}
                onFilterPropertyChange={dispatch}
                onFilterAttributeFocus={onFilterAttributeFocus}
                onSubmit={handleSubmit}
              />
            </Grow>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
};
Filter.displayName = "Filter";
export default Filter;
