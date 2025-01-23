/**
 * Dashboard panel data structure
 */
export interface BasePanelTy {
  averageHourCycleTime: AverageHourCycleTimeTy
  stationInfo: StationInfoTy
  CycleTime: CycleTimeTy
  averageHourOutput: AverageHourOutputTy
}

/**
 * Average hourly cycle time
 * @interface AverageHourCycleTimeTy
 * @property {any} HourCycleTime  Average cycle time per hour
 */
interface AverageHourCycleTimeTy {
  HourCycleTime?: any
}

/**
 * Cycle time data
 * @interface CycleTimeTy
 * @property {number} averageCycleTime Average cycle time
 */
interface CycleTimeTy {
  averageCycleTime?: number
}

/**
 * Station information
 * @interface StationInfoTy
 * @property {Array<WorkerInfoTy>} workerInfo Worker information
 */
interface StationInfoTy {
  workerInfo: Array<WorkerInfoTy>
}

/**
 * Woker information
 * @interface WorkerInfoTy
 * @property {number} currentCycleTime Current cycle time
 * @property {number} preCycleTime Previous cycle time
 * @property {string} stationName Name of the station
 */
export interface WorkerInfoTy {
  currentCycleTime: number
  preCycleTime: number
  stationName: string
}

/**
 * Average hourly output
 * @interface AverageHourOutputTy
 * @property {any} HourOutput Hourly output data
 */
export interface AverageHourOutputTy {
  HourOutput?: any
}

/**
 * Robot data structure
 * @interface RobotTy
 * @property {RobotInfoTy} [Info] Robot information
 * @property {RobotDataTy} [Data] Telemetry data
 * @property {RobotTempTy} [Temp] Real-time temperature of each axis
 * @property {RobotCurrentTy} [Current] Real-time current of each axis
 * @property {RobotPLCTy} [PLC] Control cabinet data
 */
export interface RobotTy {
  Info: RobotInfoTy
  Data: RobotDataTy
  Temp: RobotTempTy
  Current: RobotCurrentTy
  PLC: RobotPLCTy
}

/**
 * Robot information
 * @interface RobotInfoTy
 * @property {string} [name] Robot name
 * @property {string} [serialNumber] Robot serial number
 * @property {0 | 1} [equipmentStatus] Equipment status
 */
interface RobotInfoTy {
  name?: string
  serialNumber?: string
  equipmentStatus?: 0 | 1
}

/**
 * Robot telemetry data
 * @interface RobotDataTy
 * @property {string} [workingMode] Working mode
 * @property {0 | 1} [robotStatus] Robot status
 * @property {string} [robotName] Currently active program name
 * @property {number} [robotRate] Robot running rate
 */
interface RobotDataTy {
  workingMode?: string
  robotStatus?: 0 | 1
  robotName?: string
  robotRate?: number
}

/**
 * Real-time temperature of each robot axis
 * @interface RobotTempTy
 * @property {number} [A1Temp] Temperature of A1 axis
 * @property {number} [A2Temp] Temperature of A2 axis
 * @property {number} [A3Temp] Temperature of A3 axis
 * @property {number} [A4Temp] Temperature of A4 axis
 * @property {number} [A5Temp] Temperature of A5 axis
 * @property {number} [A6Temp] Temperature of A6 axis
 */
interface RobotTempTy {
  A1Temp?: number
  A2Temp?: number
  A3Temp?: number
  A4Temp?: number
  A5Temp?: number
  A6Temp?: number
}

/**
 * Real-time current of each robot axis
 * @interface RobotCurrentTy
 * @property {number} [A1Current] Current of A1 axis
 * @property {number} [A2Current] Current of A2 axis
 * @property {number} [A3Current] Current of A3 axis
 * @property {number} [A4Current] Current of A4 axis
 * @property {number} [A5Current] Current of A5 axis
 * @property {number} [A6Current] Current of A6 axis
 */
interface RobotCurrentTy {
  A1Current?: number
  A2Current?: number
  A3Current?: number
  A4Current?: number
  A5Current?: number
  A6Current?: number
}

/**
 * Control cabinet data
 * @interface RobotPLCTy
 * @property {number} [PCTemp] PC motherboard temperature
 * @property {'CHARGE_OK' | 'CHARGE_LOW' | 'CHARGE_NO'} [chargeStatus] Battery status
 * @property {number} [CPUUtility] PC CPU utilization
 */
interface RobotPLCTy {
  PCTemp?: number
  chargeStatus?: 'CHARGE_OK' | 'CHARGE_LOW' | 'CHARGE_NO'
  CPUUtility?: number
}

// Battery status mapping
export const CHARGE_STATUS = {
  CHARGE_OK: 'CHARGE OK',
  CHARGE_LOW: 'LOW CHARGE',
  CHARGE_NO: 'NO CHARGE',
}

// Equipment status mapping
export const EQUIPMENT_STATUS = { 0: '设备活跃', 1: '设备停止' }

// Robot status mapping
export const ROBOT_STATUS = { 0: '正常运行', 1: '停止运行' }
