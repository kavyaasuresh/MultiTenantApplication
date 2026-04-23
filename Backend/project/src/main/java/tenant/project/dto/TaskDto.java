package tenant.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import tenant.project.entity.TaskPriority;
import tenant.project.entity.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
public class TaskDto {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm[:ss]")
    private LocalDateTime deadline;
    
    private List<UUID> assignedUserIds;
}
