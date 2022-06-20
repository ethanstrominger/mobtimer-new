// todo: make consistent either all classes or modules (when all static)
export class TimeUtils {
  
  static secondsToMinutes(seconds: number): number {
    return seconds / 60;
  }
  
  static getNowInSeconds(): number {
    const currentMilliseconds = new Date().getTime();
    return TimeUtils.millisecondsToSeconds(currentMilliseconds); 
  }

  static millisecondsToSeconds(milliseconds: number) {
    return milliseconds / 1000;
  }
  
  static minutesToSeconds(minutes: number) : number {
    return minutes * 60;
  }
  
  static getTimeString(seconds: number): string {
    return TimeUtils.getMinutesPart(seconds) + ":" + 
           TimeUtils.getSecondsPart(seconds);
  }
  
  static getMinutesPart(seconds: number): string {
    const minutesPart = Math.trunc(seconds / 60);
    return minutesPart.toString().padStart(2, "0");
  }
  
  static getSecondsPart(seconds: number): string {
    const secondsPart = (seconds % 60);
    return secondsPart.toString().padStart(2, "0");
  }

}