package ignorance.utils;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import org.apache.log4j.Layout;
import org.apache.log4j.Level;
import org.apache.log4j.spi.LoggingEvent;

public class Log4JHttpLayout extends Layout {
	private final SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd-HH:mm:ss.SSS");
	private static final int maxNameLength = 18;

	public Log4JHttpLayout()
	{
		sdf.setTimeZone(TimeZone.getTimeZone("GMT"));
	}
	
	@Override
	public String format(LoggingEvent event) {
		long time = event.getTimeStamp();
		String name = event.getLoggerName();
		if (name.length() < maxNameLength)
			name = "                 " + name;
		name = name.substring(name.length() - maxNameLength);
		Level level = event.getLevel();
		
		String thread = event.getThreadName();
		return sdf.format(new Date(time)) + " " + name + "/" + thread + " " + level + ": " + event.getMessage() + "\n";
	}

	@Override
	public void activateOptions() {
		// TODO: I don't think we have any of these
		
	}

	@Override
	public boolean ignoresThrowable() {
		return false;
	}

}
