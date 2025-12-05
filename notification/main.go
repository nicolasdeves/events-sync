package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-gomail/gomail"
	"github.com/joho/godotenv"
)

func VerifyJwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")

		if auth == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(auth, "Bearer ")

		req, _ := http.NewRequest("POST", os.Getenv("JWT_VERIFY_URL"), nil)
		req.Header.Set("Authorization", "Bearer "+token)

		client := &http.Client{}
		resp, err := client.Do(req)

		if err != nil || resp.StatusCode != 200 {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("não achei .env, seguindo sem ele…")
	}

	r := gin.Default()

	r.POST("/send-email", VerifyJwtMiddleware(), func(c *gin.Context) {

		var body struct {
			To      string `json:"to"`
			Subject string `json:"subject"`
			Message string `json:"message"`
		}

		if err := c.BindJSON(&body); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "json errado"})
			return
		}

		host := os.Getenv("SMTP_HOST")
		username := os.Getenv("SMTP_USER")
		password := os.Getenv("SMTP_PASS")
		port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))

		msg := gomail.NewMessage()
		msg.SetHeader("From", username)
		msg.SetHeader("To", body.To)
		msg.SetHeader("Subject", body.Subject)
		msg.SetBody("text/plain", body.Message)

		dialer := gomail.NewDialer(host, port, username, password)

		if err := dialer.DialAndSend(msg); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "falhei no envio do email"})
			return
		}

		c.JSON(200, gin.H{"status": "email enviado com sucesso!"})
	})

	r.Run(os.Getenv("PORT"))
}
