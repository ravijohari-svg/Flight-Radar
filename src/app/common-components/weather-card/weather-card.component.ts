/**
 * @description
 * This component is responsible for displaying the weather card on the dashboard(authority and operator) page.
 * It takes the current weather details as input and displays the weather details.
 * It also takes the response city name as input and displays the city name.
 * It also takes the drone name as input and displays the drone name.
 * It also takes the fly condition as input and displays the fly condition.
 * The fly condition is calculated based on the weather details and the drone name.
 * The checkFlightCondition function is responsible for calculating the fly condition.
 * @author
 * Saroj Kumar Pahi
 */

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { flyabilityConditions } from '../../constants/constants';
@Component({
  selector: 'app-weather-card',
  templateUrl: './weather-card.component.html',
  styleUrls: ['./weather-card.component.scss'],
})
export class WeatherCardComponent implements OnChanges, OnInit {
  @Input() currentWeatherDetails: any;
  @Input() responseCityName: string;
  @Input() droneName: string;
  conditonToFly;
  dropdownState;
  ngOnInit(): void {
    this.conditonToFly = 'Good_to_fly';
  }
  //ngOnChanges to check the fly condition on changes
  ngOnChanges(changes): void {
    if (changes.currentWeatherDetails) {
      this.conditonToFly = this.checkFlightCondition(
        this.currentWeatherDetails?.wind.speed,
        this.currentWeatherDetails?.main.temp,
        this.currentWeatherDetails?.wind.gust,
        this.currentWeatherDetails?.visibility,
        this.currentWeatherDetails?.precipitation,
        this.droneName
      );
    }
  }

  //ToggleDropDown to show more details
  toggleDropdown() {
    this.dropdownState = !this.dropdownState;
  }
  //FlyCondition to show the fly condition based on the weather details and the drone name
  checkFlightCondition(
    wind,
    temperature,
    gustWind,
    visibility,
    precipitation,
    droneType
  ) {
    let conditions;
    if (droneType === 'Fixed Wing' || droneType === 'Hybrid e-VTOL') {
      conditions = flyabilityConditions['VTOL'];
    } else {
      conditions = flyabilityConditions['Hexa'];
    }
    const goodToFlyConditions = conditions.goodToFly;
    const flyWithCautionsConditions = conditions.flyWithCautions;

    function checkmaxCondition(condition, value) {
      return value === undefined ? true : value >= condition;
    }
    function checkminCondition(condition, value) {
      return value === undefined ? true : value <= condition;
    }
    function checkTempCondition(condition, value) {
      return value === undefined
        ? true
        : value >= condition.min && value <= condition.max;
    }
    if (
      checkminCondition(goodToFlyConditions.wind, wind) &&
      checkTempCondition(goodToFlyConditions.temperature, temperature) &&
      checkminCondition(goodToFlyConditions.gustWind, gustWind) &&
      checkmaxCondition(goodToFlyConditions.visibility, visibility) &&
      checkminCondition(goodToFlyConditions.precipitation, precipitation)
    ) {
      return 'Good_to_fly';
    } else if (
      checkminCondition(flyWithCautionsConditions.wind, wind) &&
      checkTempCondition(flyWithCautionsConditions.temperature, temperature) &&
      checkminCondition(flyWithCautionsConditions.gustWind, gustWind) &&
      checkmaxCondition(flyWithCautionsConditions.visibility, visibility) &&
      checkminCondition(flyWithCautionsConditions.precipitation, precipitation)
    ) {
      return 'Caution_flying';
    } else {
      return 'Avoid_flying';
    }
  }
}
