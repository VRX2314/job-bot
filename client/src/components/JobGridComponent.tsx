import React from "react";
import styles from "../styles/jobElement.module.css";

const JobGridComponent = (props) => {
  const leftList = props.reasons_match.map((elem, index) => {
    return <li key={index.toString()}>{elem}</li>;
  });

  const rightList = props.reasons_no_match.map((elem, index) => {
    return <li key={index.toString()}>{elem}</li>;
  });

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1>{props.title}</h1>
        <h2>{props.company}</h2>
        <h2>{props.score}</h2>
      </div>
      <div className={styles.bottom}>
        <div className={styles.left}>
          <ul className={styles.list}>{leftList}</ul>
        </div>
        <div className={styles.right}>
          <ul className={styles.list}>
            <li>{rightList}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobGridComponent;
