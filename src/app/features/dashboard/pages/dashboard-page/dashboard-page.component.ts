import { Component } from '@angular/core';
import { StatCardComponent } from "../../components/stat-card/stat-card.component";
import { TrafficChartComponent } from '../../components/traffic-chart/traffic-chart.component';
import { ThreatTableComponent } from '../../components/threat-table/threat-table.component';

@Component({
  selector: 'app-dashboard-page.component',
  imports: [StatCardComponent,TrafficChartComponent,ThreatTableComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {

}
